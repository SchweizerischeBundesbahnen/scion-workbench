import {Component, computed, DestroyRef, effect, ElementRef, inject, InjectionToken, input, linkedSignal, untracked, viewChild} from '@angular/core';
import {MSubMenuItem} from '../ɵmenu';
import {SciMenuRegistry} from '../menu.registry';
import {UUID} from '@scion/toolkit/uuid';
import {NgComponentOutlet} from '@angular/common';

export const SUBMENU_ITEM = new InjectionToken<MSubMenuItem>('SUBMENU_ITEM');

@Component({
  selector: 'wb-menu',
  imports: [
    NgComponentOutlet,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  host: {
    '[style.--anchor]': '`--${popoverId}`',
  },
})
export class MenuComponent {

  public readonly subMenuItem = input.required<MSubMenuItem>();

  private readonly _menuRegistry = inject(SciMenuRegistry);

  protected readonly _popover = viewChild<ElementRef<HTMLElement>>('popover');
  protected readonly menuItems = computed(() => {
    const subMenuItem = this.subMenuItem();

    return untracked(() => {
      return [
        ...subMenuItem.children,
        ...this._menuRegistry.findMenuContributions(subMenuItem.id).flatMap(m => m.menuItems),
      ];
    });
  });
  protected readonly popoverId = UUID.randomUUID();
  protected readonly MenuComponent = MenuComponent;
  // protected readonly activeSubMenuItem = signal<MSubMenuItem | undefined>(undefined);
  protected readonly activeSubMenuItem = linkedSignal({
    source: this.subMenuItem,
    computation: (): MSubMenuItem | undefined => undefined,
  });

  constructor() {
    console.log('>>> construct MenuComponent');
    // console.log('>>> construct MenuComponent', this.menuItems());

    inject(DestroyRef).onDestroy(() => {
      console.log('>>> onDestroy MenuComponent', this.menuItems());
    })

    effect(() => {
      const popover = this._popover();
      if (!popover) {
        return;
      }
      if (this.activeSubMenuItem()) {
        popover.nativeElement.showPopover();
      }
      else {
        popover.nativeElement.hidePopover();
      }
    });
  }

  protected onMenuItemMouseEnter(): void {
    this.activeSubMenuItem.set(undefined);
  }

  protected onSubMenuMouseEnter(subMenuItem: MSubMenuItem): void {
    this.activeSubMenuItem.set(subMenuItem);
  }

  protected onToggle(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      console.log('>>> closing menu');
      this.activeSubMenuItem.set(undefined);
    }
  }
}

// function getMenuItems(): Array<MMenuItem | MSubMenuItem> {
//   const subMenu = inject(SUBMENU_ITEM);
//   const menuRegistry = inject(SciMenuRegistry);
//   return [
//     ...subMenu.children,
//     ...menuRegistry.findMenuContributions(subMenu.id).flatMap(m => m.menuItems),
//   ];
// }
