import {ChangeDetectionStrategy, Component, DOCUMENT, effect, inject, Injector, input, linkedSignal, output, signal, untracked, ViewContainerRef} from '@angular/core';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {ɵSciMenuService} from '../ɵmenu.service';
import {MaybeSignal, RequireOne, SciAttributesDirective, SciComponentOutletDirective} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';
import {SciToolbarControlPipe} from './toolbar-control.directive';
import {SciIconComponent} from '@scion/sci-components/icon';

@Component({
  selector: 'sci-toolbar-group',
  templateUrl: './toolbar-group.component.html',
  styleUrl: './toolbar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciComponentOutletDirective,
    SciAttributesDirective,
    SciToolbarControlPipe,
    SciIconComponent,
  ],
})
export class SciToolGroupComponent {

  public readonly menuItems = input.required<Array<SciMenuItem | SciMenu | SciMenuGroup>>();
  public readonly disabled = input<boolean>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly menuOpen = output<boolean>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _childGroupMenuOpen = signal(false);
  private readonly _document = inject(DOCUMENT);

  protected readonly activeMenuItem = linkedSignal<SciMenuItemLike[], {menu: SciMenu, element: HTMLElement} | null>({
    source: this.menuItems,  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  constructor() {
    const injector = inject(Injector);

    // Open popover when hovering over a menu item, or hide it otherwise.
    effect((onCleanup) => {
      const activeMenuItem = this.activeMenuItem();
      // Attach popover to configured view ref. Defaults to this component's view ref.
      // Controls where to add the popup, e.g., required for toolbar in menu button to not be child of the menu item (hover state)
      const viewContainerRef = this.viewContainerRef() ?? injector.get(ViewContainerRef);

      untracked(() => {
        if (!activeMenuItem) {
          return;
        }

        const ref = this._menuService.open(activeMenuItem.menu.children, {
          anchor: activeMenuItem.element,
          viewContainerRef,
          cssClass: activeMenuItem.menu.cssClass,
          filter: activeMenuItem.menu.menu.filter as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>}> | boolean | undefined,
          size: {
            width: activeMenuItem.menu.menu.width,
            minWidth: activeMenuItem.menu.menu.minWidth,
            maxWidth: activeMenuItem.menu.menu.maxWidth,
            maxHeight: activeMenuItem.menu.menu.maxHeight,
          },
          align: 'vertical',
        });
        ref.onClose(() => {
          // do not close other menu
          this.activeMenuItem.update(it => it === activeMenuItem ? null : it);
        });
        onCleanup(() => ref.close());
      });
    });

    effect(() => {
      const open = this.activeMenuItem() !== null || this._childGroupMenuOpen();
      untracked(() => this.menuOpen.emit(open));
    });
  }

  protected async onSelect(menuItem: SciMenuItem): Promise<void> {
    if (await menuItem.onSelect()) {
      this.closeMenus(); // e.g., when clicking an action in a menu's action toolbar
    }
  }

  protected onChildGroupMenuOpen(open: boolean): void {
    this._childGroupMenuOpen.set(open);
  }

  protected onMenuClick(menuItem: {menu: SciMenu, element: HTMLElement} | null): void {
    this.activeMenuItem.set(menuItem);
  }

  private closeMenus(): void {
    const popover = this._document.documentElement.appendChild(this._document.createElement('div'));
    popover.setAttribute('popover', '');
    popover.style.setProperty('display', 'none');
    popover.showPopover();
    popover.remove();
  }
}

