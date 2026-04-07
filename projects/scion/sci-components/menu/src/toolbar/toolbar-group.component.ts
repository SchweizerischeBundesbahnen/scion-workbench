import {ChangeDetectionStrategy, Component, effect, inject, Injector, input, linkedSignal, output, runInInjectionContext, signal, untracked, ViewContainerRef} from '@angular/core';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {ɵSciMenuService} from '../ɵmenu.service';
import {MaybeSignal, RequireOne, SciComponentOutletDirective} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';

@Component({
  selector: 'sci-toolbar-group',
  templateUrl: './toolbar-group.component.html',
  styleUrl: './toolbar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciComponentOutletDirective,
  ],
})
export class SciToolGroupComponent {

  public readonly menuItems = input.required<Array<SciMenuItem | SciMenu | SciMenuGroup>>();
  public readonly disabled = input<boolean>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly menuOpen = output<boolean>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _injector = inject(Injector);
  private readonly _childGroupMenuOpen = signal(false);

  protected readonly activeSubMenuItem = linkedSignal<SciMenuItemLike[], {menu: SciMenu, element: HTMLElement} | null>({
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
            filter: activeSubMenuItem.menu.menu.filter as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>}> | boolean | undefined,
            size: {
              width: activeSubMenuItem.menu.menu.width,
              minWidth: activeSubMenuItem.menu.menu.minWidth,
              maxWidth: activeSubMenuItem.menu.menu.maxWidth,
              maxHeight: activeSubMenuItem.menu.menu.maxHeight,
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
      const open = this.activeSubMenuItem() !== null || this._childGroupMenuOpen();
      untracked(() => this.menuOpen.emit(open));
    });
  }

  protected onSelect(menuItem: SciMenuItem): void {
    runInInjectionContext(this._injector, () => void menuItem.onSelect());
  }

  protected onChildGroupMenuOpen(open: boolean): void {
    this._childGroupMenuOpen.set(open);
  }

  protected onSubMenuClick(menuItem: {menu: SciMenu, element: HTMLElement} | null): void {
    this.activeSubMenuItem.set(menuItem);
  }
}

