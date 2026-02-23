import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, linkedSignal, Signal, untracked, ViewContainerRef} from '@angular/core';
import {installMenuAccelerators} from '../menu-accelerators';
import {ɵSciMenuService} from '../ɵmenu.service';
import {MaybeArray, MaybeSignal, RequireOne} from '@scion/sci-components/common';
import {SciMenu} from '../menu.model';
import {Translatable} from '@scion/sci-components/text';
import {SciMenuEnvironmentProviders} from '../environment/menu-environment-providers';

/**
 * TODO [menu]: Explain how to size the menubar. (height can be set)
 */
@Component({
  selector: 'sci-menubar',
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SciMenubarComponent {

  public readonly name = input.required<`menubar:${string}`>();
  public readonly context = input<Map<string, unknown>>();
  public readonly acceleratorTarget = input<MaybeArray<Element | ElementRef<Element>> | undefined>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _context = inject(SciMenuEnvironmentProviders).provideContext(this.context);

  protected readonly menus = this.computeMenus();

  protected readonly activeMenu = linkedSignal<SciMenu[], {menu: SciMenu, element: HTMLElement; closing?: true} | null>({
    source: this.menus,  // reset active menu when menus change.
    computation: () => null,
    equal: (a, b) => a?.menu === b?.menu,
  });

  constructor() {
    this.installAccelerators();

    const injector = inject(Injector);

    // Open or close popover.
    effect((onCleanup) => {
      if (!this.activeMenu()) {
        return;
      }

      const {menu, element} = this.activeMenu()!;
      // Attach popover to configured view ref. Defaults to this component's view ref.
      // Controls where to add the popup.
      const viewContainerRef = this.viewContainerRef() ?? injector.get(ViewContainerRef);

      untracked(() => {
        const ref = this._menuService.open(menu.children, {
          anchor: element,
          viewContainerRef,
          filter: menu.filter as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean}> | boolean | undefined,
          size: {
            width: menu.width,
            minWidth: menu.minWidth,
            maxWidth: menu.maxWidth,
            maxHeight: menu.maxHeight,
          },
          cssClass: menu.cssClass,
          align: 'vertical',
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
        })
        onCleanup(() => ref.close());
      });
    });
  }

  protected onMenuMouseDown(menu: SciMenu): void {
    const activeMenu = this.activeMenu();

    // Mark opened menu as closing to prevent re-opening it on subsequent click event.
    if (activeMenu?.menu === menu) {
      activeMenu.closing = true;
    }
  }

  protected onMenuClick(menu: SciMenu, element: HTMLElement): void {
    // Toggle menu state.
    this.activeMenu.update(activeMenu => activeMenu?.menu === menu ? null : {menu, element});
  }

  protected onMenuMouseEnter(menu: SciMenu, element: HTMLElement): void {
    this.activeMenu.update(activeMenu => activeMenu ? {menu, element} : null);
  }

  protected onMenuMouseLeave(menu: SciMenu): void {
    // Cleanup "stale" closing state, i.e., moving mouse out of button while pressed.
    const activeMenu = this.activeMenu();
    if (activeMenu?.menu === menu && activeMenu.closing) {
      this.activeMenu.set(null);
    }
  }

  private computeMenus(): Signal<SciMenu[]> {
    const menuItems = this._menuService.menuItems(this.name, this._context);
    return computed(() => menuItems().filter(menuItem => menuItem.type === 'menu'));
  }

  private installAccelerators(): void {
    const injector = inject(Injector);

    // TODO [menu] Do we have to use a root effect? Was the case in previous implementation
    // // Use root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    // rootEffect(onCleanup => {

    effect(onCleanup => {
      const name = this.name();
      const target = this.acceleratorTarget();
      const context = this._context();

      untracked(() => {
        const ref = installMenuAccelerators(name, {target, context, injector});
        onCleanup(() => ref.dispose());
      });
    });
  }
}
