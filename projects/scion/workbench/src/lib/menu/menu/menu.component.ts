import {Component, computed, DOCUMENT, effect, ElementRef, inject, InjectionToken, input, linkedSignal, signal, Signal, untracked, viewChild} from '@angular/core';
import {MMenuGroup, MMenuItem, MSubMenuItem} from '../ɵmenu';
import {SciMenuRegistry} from '../menu.registry';
import {UUID} from '@scion/toolkit/uuid';
import {JoinPipe} from './join.pipe';
import {MenuItemGroupComponent} from './menu-item-group.component';
import {MenuItemFilterComponent} from './menu-item-filter/menu-item-filter.component';
import {MenuItemFilter} from './menu-item-filter/menu-item-filter.service';

export const SUBMENU_ITEM = new InjectionToken<MSubMenuItem>('SUBMENU_ITEM');

@Component({
  selector: 'sci-menu',
  imports: [
    JoinPipe,
    MenuItemGroupComponent,
    MenuItemFilterComponent,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  providers: [
    MenuItemFilter,
  ],
  host: {
    '[class.gutter-column-hidden]': '!hasGutterColumn()',
    '[class.is-group]': 'isGroup()',
  },
})
export class MenuComponent {

  public readonly subMenuItem = input.required<MSubMenuItem | MMenuGroup>();
  public readonly disabled = input<boolean>();
  public readonly withGutterColumn = input<boolean>();

  private readonly _menuRegistry = inject(SciMenuRegistry);
  private readonly _popover = viewChild('popover', {read: ElementRef<HTMLElement>});
  private readonly _filter = inject(MenuItemFilter);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);

  protected readonly popoverId = UUID.randomUUID();
  protected readonly hasGutterColumn = computed(() => this.withGutterColumn() ?? (!!this.subMenuItem().filter || hasGutter(this.menuItems())));
  protected readonly menuItems = this.computeMenuItems();
  protected readonly activeSubMenuItem = linkedSignal<MSubMenuItem | MMenuGroup, MSubMenuItem | undefined>({
    source: this.subMenuItem,  // reset active sub menu item when this component is re-used
    computation: () => undefined,
  });

  protected readonly isGroup = computed(() => this.subMenuItem().type === 'group');
  protected readonly isGroupVisible = signal(true);

  constructor() {
    // Compute expanded state group.
    effect(() => {
      const subMenuItem = this.subMenuItem();
      untracked(() => {
        if (subMenuItem.type === 'group') {
          this.isGroupVisible.set(typeof subMenuItem.collapsible === 'object' ? !subMenuItem.collapsible.collapsed : true);
        }
      });
    })

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

  protected onGroupToggle(): void {
    this.isGroupVisible.update(expanded => !expanded);
  }

  protected onMenuItemMouseEnter(menuItem: MMenuItem | MSubMenuItem | MMenuGroup): void {
    this.activeSubMenuItem.set(menuItem.type === 'sub-menu-item' ? menuItem : undefined);

    // Create and display "fake" popover to close popover of other groups or menus.
    if (!this.activeSubMenuItem()) {
      const popover = this._host.appendChild(this._document.createElement('div'));
      popover.setAttribute('popover', '');
      popover.style.setProperty('display', 'none');
      popover.showPopover();
      popover.remove();
    }
  }

  protected onTogglePopover(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      this.activeSubMenuItem.set(undefined);
    }
  }

  protected onFilterChange(filter: string): void {
    this._filter.setFilter(filter);
  }

  private computeMenuItems(): Signal<Array<MMenuItem | MSubMenuItem | MMenuGroup>> {
    return computed(() => {
      const subMenuItem = this.subMenuItem();

      // TODO [MENU] Sort by order (e.g., after, before)
      return subMenuItem.children
        .concat(this._menuRegistry.findMenuContributions(subMenuItem.id).flatMap(m => m.menuItems))
        .filter(menuItem => this.matchesFilter(menuItem)());
    });
  }

  private matchesFilter(menuItem: MMenuItem | MSubMenuItem | MMenuGroup): Signal<boolean> {
    switch (menuItem.type) {
      case 'menu-item':
        return this._filter.matches(menuItem.label);
      case 'sub-menu-item':
        return computed(() => this._filter.matches(menuItem.label)() || menuItem.children.some(child => this.matchesFilter(child)())); // TODO [menu] consider contributions
      case 'group':
        return computed(() => this._filter.matches(menuItem.label)() || menuItem.children.some(child => this.matchesFilter(child)())); // TODO [menu] consider contributions
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
        return menuItem.collapsible || hasGutter(menuItem.children); // TODO [menu] consider contributions
    }
  });
}
