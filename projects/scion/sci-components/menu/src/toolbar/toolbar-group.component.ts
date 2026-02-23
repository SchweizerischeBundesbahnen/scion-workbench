import {ChangeDetectionStrategy, Component, DOCUMENT, effect, inject, Injector, input, linkedSignal, output, signal, untracked, ViewContainerRef} from '@angular/core';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {ɵSciMenuService} from '../ɵmenu.service';
import {MaybeSignal, RequireOne, SciAttributesDirective, SciComponentOutletDirective} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';
import {SciToolbarControlPipe} from './toolbar-control.directive';
import {SciIconComponent} from '@scion/sci-components/icon';
import {FormatAcceleratorPipe} from '../menu/accelerator-format.pipe';

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
    FormatAcceleratorPipe,
  ],
  host: {
    '[attr.data-orientation]': 'orientation()',
  },
})
export class SciToolGroupComponent {

  public readonly menuItems = input.required<Array<SciMenuItem | SciMenu | SciMenuGroup>>();
  public readonly orientation = input.required<'horizontal' | 'vertical'>();
  public readonly disabled = input<boolean>();
  public readonly popoverViewContainerRef = input<ViewContainerRef | undefined>();
  public readonly menuOpen = output<boolean>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _childGroupMenuOpen = signal(false);
  private readonly _document = inject(DOCUMENT);

  protected readonly activeMenu = linkedSignal<SciMenuItemLike[], {menu: SciMenu, element: HTMLElement; closing?: true} | null>({
    source: this.menuItems,  // reset active sub menu item when this component is re-used
    computation: () => null,
    equal: (a, b) => a?.menu === b?.menu,
  });

  constructor() {
    const injector = inject(Injector);

    // Open or close popover.
    effect((onCleanup) => {
      if (!this.activeMenu()) {
        return;
      }

      const {menu, element} = this.activeMenu()!;
      // Attach popover to configured view ref. Defaults to this component's view ref.
      // Controls where to add the popup, e.g., required for toolbar in menu button to not be child of the menu item (hover state)
      const popoverViewContainerRef = this.popoverViewContainerRef() ?? injector.get(ViewContainerRef);

      untracked(() => {
        const ref = this._menuService.open(menu.children, {
          anchor: element,
          viewContainerRef: popoverViewContainerRef,
          filter: menu.filter as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean}> | boolean | undefined,
          size: {
            width: menu.width,
            minWidth: menu.minWidth,
            maxWidth: menu.maxWidth,
            maxHeight: menu.maxHeight,
          },
          cssClass: menu.cssClass,
          align: this.orientation() === 'horizontal' ? 'vertical' : 'horizontal',
        });
        ref.onClose(() => {
          const activeMenu = this.activeMenu();

          // Do not clear state if menu button was clicked to close it. Otherwise, the menu would re-open.
          if (activeMenu?.menu === menu && activeMenu.closing) {
            return;
          }

          // Do not clear state if another menu was opened in the meantime.
          if (activeMenu?.menu !== menu) {
            return;
          }

          this.activeMenu.set(null);
        });
        onCleanup(() => ref.close());
      });
    });

    effect(() => {
      const open = this.activeMenu() !== null || this._childGroupMenuOpen();
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

  protected onMenuMouseDown(menu: SciMenu): void {
    const activeMenu = this.activeMenu();

    // Mark opened menu as closing to prevent re-opening it on subsequent click event.
    if (activeMenu?.menu === menu) {
      activeMenu.closing = true;
    }
  }

  protected onMenuMouseLeave(menu: SciMenu): void {
    // Cleanup "stale" closing state, i.e., moving mouse out of button while pressed.
    const activeMenu = this.activeMenu();
    if (activeMenu?.menu === menu && activeMenu.closing) {
      this.activeMenu.set(null);
    }
  }

  protected onMenuClick(menu: SciMenu, element: HTMLElement): void {
    // Toggle menu state.
    this.activeMenu.update(activeMenu => activeMenu?.menu === menu ? null : {menu, element});
  }

  private closeMenus(): void {
    const popover = this._document.documentElement.appendChild(this._document.createElement('div'));
    popover.setAttribute('popover', '');
    popover.style.setProperty('display', 'none');
    popover.showPopover();
    popover.remove();
  }
}

