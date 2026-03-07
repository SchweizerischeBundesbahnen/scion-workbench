import {ChangeDetectionStrategy, Component, effect, inject, Injector, input, linkedSignal, output, runInInjectionContext, untracked, ViewContainerRef} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {MenuItemStateDirective} from '../menu/menu-item-state.directive';
import {SciMenuContribution, SciMenuContributions, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';
import {ɵSciMenuService} from '../ɵmenu.service';

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

  public readonly menuItems = input.required<SciMenuContributions>();
  public readonly disabled = input<boolean>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly groupEmpty = output<boolean>();
  public readonly groupMenuOpen = output<boolean>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _injector = inject(Injector);

  protected readonly activeSubMenuItem = linkedSignal<SciMenuContributions, {menu: SciMenuContribution, element: HTMLElement} | null>({
    source: this.menuItems,  // reset active sub menu item when this component is re-used
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
          const ref = this._menuService.open(activeSubMenuItem.menu.children, {
            anchor: activeSubMenuItem.element,
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
      this.groupEmpty.emit(this.menuItems().every(isEmtpy));
    });
  }

  protected onSelect(menuItem: SciMenuItemContribution): void {
    runInInjectionContext(this._injector, () => void menuItem.onSelect());
  }

  protected onSubMenuClick(menuItem: {menu: SciMenuContribution, element: HTMLElement} | null): void {
    this.activeSubMenuItem.set(menuItem);
  }
}

function isEmtpy(menuItem: SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution): boolean {
  switch (menuItem.type) {
    case 'menu-item':
      return false;
    case 'menu':
    case 'group':
      return menuItem.children.every(isEmtpy);
  }
}
