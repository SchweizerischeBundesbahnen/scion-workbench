import {ChangeDetectionStrategy, Component, computed, effect, inject, Injector, input, linkedSignal, output, signal, Signal, untracked, ViewContainerRef} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {MenuItemStateDirective} from '../menu/menu-item-state.directive';
import {SciMenuContribution, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';
import {SciMenuService} from '../menu.service';

@Component({
  selector: 'sci-toolbar-group',
  templateUrl: './toolbar-group.component.html',
  styleUrl: './toolbar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgComponentOutlet,
    MenuItemStateDirective,
  ],
})
export class SciToolGroupComponent {

  public readonly name = input.required<Array<`toolbar:${string}` | `group:${string}`>>();
  public readonly context = input.required<Map<string, unknown>>();
  public readonly disabled = input<boolean>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly groupEmpty = output<boolean>();
  public readonly groupMenuOpen = output<boolean>();

  private readonly _menuService = inject(SciMenuService);

  protected readonly menuItems = this.computeToolbarItems();
  protected readonly activeSubMenuItem = linkedSignal<{location: Array<`toolbar:${string}` | `group:${string}`>; context: Map<string, unknown> | undefined}, {menu: SciMenuContribution, element: HTMLElement} | null>({
    source: computed(() => ({location: this.name(), context: this.context()})),  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  constructor() {
    const injector = inject(Injector);

    // Open popover when hovering over a submenu item, or hide it otherwise.
    effect((onCleanup) => {
      const activeSubMenuItem = this.activeSubMenuItem();
      // Attach popover to configured view ref. Defaults to this component's view ref.
      // Controls where to add the popup, e.g., required for toolbar in menu button to not be child of the menu item (hover state)
      const viewContainerRef = this.viewContainerRef() ?? injector.get(ViewContainerRef);

      untracked(() => {
        if (activeSubMenuItem) {
          const ref = this._menuService.open(activeSubMenuItem.menu.name, {
            anchor: activeSubMenuItem.element,
            context: this.context(),
            viewContainerRef,
            cssClass: activeSubMenuItem.menu.cssClass,
            filter: activeSubMenuItem.menu.menu.filter,
            size: {
              minWidth: activeSubMenuItem.menu.menu.minWidth,
              maxWidth: activeSubMenuItem.menu.menu.maxWidth,
              width: activeSubMenuItem.menu.menu.width,
            },
            align: 'vertical',
          });
          ref.onClose(() => {
            // do not close other menu
            this.activeSubMenuItem.update(it => it === activeSubMenuItem ? null : it);
          });
          onCleanup(() => ref.close());
        }
      });
    });

    effect(() => {
      const open = this.activeSubMenuItem() !== null;
      untracked(() => this.groupMenuOpen.emit(open));
    });

    effect(() => {
      this.groupEmpty.emit(this.menuItems().every(menuItem => this.isEmtpy(menuItem)()));
    });
  }

  private computeToolbarItems(): Signal<Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>> {
    return computed(() => this._menuService.menuContributions(this.name(), this.context())());
  }

  protected onSubMenuClick(menuItem: {menu: SciMenuContribution, element: HTMLElement} | null): void {
    this.activeSubMenuItem.set(menuItem);
  }

  private isEmtpy(menuItem: SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution): Signal<boolean> {
    switch (menuItem.type) {
      case 'menu-item':
        return signal(false);
      case 'menu':
      case 'group':
        return computed(() => this._menuService.menuContributions(menuItem.name, this.context())().every(menuItem => this.isEmtpy(menuItem)()));
    }
  }
}
