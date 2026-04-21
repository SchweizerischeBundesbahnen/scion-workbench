import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, linkedSignal, Signal, untracked, ViewContainerRef} from '@angular/core';
import {SciMenuContextProvider} from '../menu-context-provider';
import {installMenuAccelerators} from '../menu-accelerators';
import {ɵSciMenuService} from '../ɵmenu.service';
import {coerceSignal, MaybeArray, MaybeSignal, RequireOne} from '@scion/sci-components/common';
import {Objects} from '@scion/toolkit/util';
import {SciMenu} from '../menu.model';
import {Translatable} from '@scion/sci-components/text';

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
  private readonly _context = this.computeContext();

  protected readonly menus = this.computeMenus();

  protected readonly activeMenu = linkedSignal<SciMenu[], {menu: SciMenu, element: HTMLElement} | null>({
    source: this.menus,  // reset active menu when menus change.
    computation: () => null,
  });

  constructor() {
    this.installAccelerators();

    const injector = inject(Injector);

    // Open popover when hovering over a menu item, or hide it otherwise.
    effect((onCleanup) => {
      const activeMenu = this.activeMenu();
      // Attach popover to configured view ref. Defaults to this component's view ref.
      // Controls where to add the popup.
      const viewContainerRef = this.viewContainerRef() ?? injector.get(ViewContainerRef);

      untracked(() => {
        if (!activeMenu) {
          return;
        }

        const ref = this._menuService.open(activeMenu.menu.children, {
          anchor: activeMenu.element,
          viewContainerRef,
          cssClass: activeMenu.menu.cssClass,
          filter: activeMenu.menu.menu.filter as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>}> | boolean | undefined,
          size: {
            width: activeMenu.menu.menu.width,
            minWidth: activeMenu.menu.menu.minWidth,
            maxWidth: activeMenu.menu.menu.maxWidth,
            maxHeight: activeMenu.menu.menu.maxHeight,
          },
          align: 'vertical',
        });
        ref.onClose(() => {
          // do not close other menu
          this.activeMenu.update(it => it === activeMenu ? null : it);
        });
        onCleanup(() => ref.close());
      });
    });
  }

  protected onMenuClick(menu: {menu: SciMenu, element: HTMLElement} | null): void {
    this.activeMenu.update(activeMenu => activeMenu?.menu === menu?.menu ? null : menu);
  }

  protected onMenuMouseEnter(menuItem: {menu: SciMenu, element: HTMLElement} | null): void {
    // Activate menu item only if one is already active.
    this.activeMenu.update(activeMenu => activeMenu ? menuItem : null);
  }

  private computeMenus(): Signal<SciMenu[]> {
    const menuItems = this._menuService.menuItems(this.name, this._context);
    return computed(() => menuItems().filter(menuItem => menuItem.type === 'menu'));
  }

  private computeContext(): Signal<Map<string, unknown>> {
    const environmentContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideMenuContext());
    return computed(() => new Map([...environmentContext?.() ?? new Map(), ...this.context() ?? new Map()]), {equal: Objects.isEqual});
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
