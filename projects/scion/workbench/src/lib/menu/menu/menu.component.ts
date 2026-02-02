import {Component, computed, DestroyRef, effect, ElementRef, inject, InjectionToken, input, linkedSignal, Signal, untracked, viewChild} from '@angular/core';
import {MMenuGroup, MMenuItem, MSubMenuItem} from '../ɵmenu';
import {SciMenuRegistry} from '../menu.registry';
import {UUID} from '@scion/toolkit/uuid';
import {JoinPipe} from './join.pipe';
import {MenuItemDirective} from './menu-item.directive';

export const SUBMENU_ITEM = new InjectionToken<MSubMenuItem>('SUBMENU_ITEM');

@Component({
  selector: 'wb-menu',
  imports: [
    JoinPipe,
    MenuItemDirective,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  host: {
    '[class.gutter-column-hidden]': '!hasGutterColumn()',
    '[class.is-group]': 'isGroup()',
  },
})
export class MenuComponent {

  public readonly subMenuItem = input.required<MSubMenuItem | MMenuGroup>();
  public readonly withGutterColumn = input<boolean>();

  protected hasGutterColumn = computed(() => this.withGutterColumn() ?? hasGutter(this.menuItems()));

  private readonly _menuRegistry = inject(SciMenuRegistry);
  private readonly _popover = viewChild('popover', {read: ElementRef<HTMLElement>});

  protected readonly popoverId = UUID.randomUUID();
  protected readonly menuItems = this.computeMenuItems();
  protected readonly activeSubMenuItem = linkedSignal<MSubMenuItem | MMenuGroup, MSubMenuItem | undefined>({
    source: this.subMenuItem,  // reset active sub menu item when this component is re-used
    computation: () => undefined,
  });

  protected isGroup = computed(() => this.subMenuItem().type === 'group');

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      console.log('>>> onDestroy MenuComponent', this.menuItems());
    });

    effect(() => {
      console.log('>>> menu input changed', this.subMenuItem());
    });

    // Open popover when hovering over a submenu item, or hide it otherwise.
    effect(() => {
      const popover = this._popover();
      if (this.activeSubMenuItem()) {
        popover?.nativeElement.showPopover();
      }
      else {
        popover?.nativeElement.hidePopover();
      }
    });
  }

  private computeMenuItems(): Signal<Array<MMenuItem | MSubMenuItem | MMenuGroup>> {
    return computed(() => {
      const subMenuItem = this.subMenuItem();

      // TODO [MENU] Sort by order (e.g., after, before)
      return untracked(() => {
        return [
          ...subMenuItem.children,
          ...this._menuRegistry.findMenuContributions(subMenuItem.id).flatMap(m => m.menuItems),
        ];
      });
    });
  }

  protected onMenuItemMouseEnter(menuItem: MMenuItem | MSubMenuItem): void {
    this.activeSubMenuItem.set(menuItem.type === 'sub-menu-item' ? menuItem : undefined);
  }

  protected onTogglePopover(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      console.log('>>> closing menu popover');
      this.activeSubMenuItem.set(undefined);
    }
  }
}

function hasGutter(menuItems: Array<MMenuItem | MSubMenuItem | MMenuGroup>): boolean {
  return menuItems.some(menuItem => {
    switch (menuItem.type) {
      case 'menu-item':
        return menuItem.icon || menuItem.checked !== undefined;
      case 'sub-menu-item':
        return menuItem.icon;
      case 'group':
        return hasGutter(menuItem.children);
    }
  })
}
