import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, linkedSignal, output, signal, Signal, TemplateRef, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {SciMenuContributionRegistry} from '../menu-contribution.registry';
import {MenuComponent} from '../menu/menu.component';
import {UUID} from '@scion/toolkit/uuid';
import {NgComponentOutlet} from '@angular/common';
import {MenuItemStateDirective} from '../menu/menu-item-state.directive';
import {SciDimension} from '@scion/components/dimension';
import {SciMenuContribution, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';

@Component({
  selector: 'sci-toolbar-group',
  templateUrl: './toolbar-group.component.html',
  styleUrl: './toolbar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MenuComponent,
    NgComponentOutlet,
    MenuItemStateDirective,
  ],
})
export class SciToolGroupComponent {

  public readonly contextElement = input.required<`toolbar:${string}` | SciMenuGroupContribution>();
  public readonly disabled = input<boolean>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly groupEmpty = output<boolean>();
  public readonly groupMenuOpen = output<boolean>();

  private readonly _menuContributionRegistry = inject(SciMenuContributionRegistry);
  private readonly _popover = viewChild('popover', {read: ElementRef<HTMLElement>});
  private readonly _popoverTemplate = viewChild.required('popover_template', {read: TemplateRef<void>});

  protected readonly popoverId = UUID.randomUUID();
  protected readonly menuItems = this.computeToolbarItems();
  protected readonly activeSubMenuItem = linkedSignal<string | SciMenuGroupContribution, {subMenuItem: SciMenuContribution, bounds: Signal<SciDimension>} | null>({
    source: this.contextElement,  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  constructor() {
    // Open popover when hovering over a submenu item, or hide it otherwise.
    effect(() => {
      const popover = this._popover();
      const activeSubMenuItem = this.activeSubMenuItem();

      untracked(() => {
        if (activeSubMenuItem) {
          popover?.nativeElement.showPopover();
        }
        else {
          popover?.nativeElement.hidePopover();
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

    // Attach popover to configured view ref. Defaults to this component's view ref.
    const injector = inject(Injector);
    effect(onCleanup => {
      const popoverTemplate = this._popoverTemplate();
      const viewContainerRef = this.viewContainerRef() ?? injector.get(ViewContainerRef);

      untracked(() => {
        const popoverViewRef = viewContainerRef.createEmbeddedView(popoverTemplate, undefined, {injector});
        popoverViewRef.detectChanges(); // required?
        onCleanup(() => () => popoverViewRef.destroy());
      });
    });
  }

  private computeToolbarItems(): Signal<Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>> {
    return computed(() => {
      const contextElement = this.contextElement();
      if (typeof contextElement === 'string') {
        return this._menuContributionRegistry.menuContributions(contextElement)();
      }

      return this._menuContributionRegistry.menuContributions(contextElement.id, contextElement.name)();
    });
  }

  protected onSubMenuClick(subMenuItem: SciMenuContribution, bounds: Signal<SciDimension>): void {
    this.activeSubMenuItem.update(activeSubMenuItem => activeSubMenuItem?.subMenuItem === subMenuItem ? null : {subMenuItem, bounds});
  }

  protected onTogglePopover(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      this.activeSubMenuItem.set(null);
    }
  }

  private isEmtpy(menuItem: SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution): Signal<boolean> {
    switch (menuItem.type) {
      case 'menu-item':
        return signal(false);
      case 'menu':
      case 'group':
        return computed(() => this._menuContributionRegistry.menuContributions(menuItem.id, menuItem.name)().every(menuItem => this.isEmtpy(menuItem)()));
    }
  }
}
