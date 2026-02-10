import {ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, forwardRef, inject, input, linkedSignal, signal, Signal, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {MMenuGroup, MMenuItem, MSubMenuItem} from '../ɵmenu';
import {SciMenuRegistry} from '../menu.registry';
import {UUID} from '@scion/toolkit/uuid';
import {JoinPipe} from './join.pipe';
import {MenuItemGroupComponent} from './menu-item-group.component';
import {MenuItemFilterComponent} from './menu-item-filter/menu-item-filter.component';
import {MenuItemFilter} from './menu-item-filter/menu-item-filter.service';
import {SciToolbarComponent} from '../toolbar/toolbar.component';
import {ToolbarStateDirective} from './toolbar-state.directive';
import {MenuItemStateDirective} from './menu-item-state.directive';
import {NgComponentOutlet} from '@angular/common';

@Component({
  selector: 'sci-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JoinPipe,
    MenuItemGroupComponent,
    MenuItemFilterComponent,
    forwardRef(() => SciToolbarComponent),
    ToolbarStateDirective,
    MenuItemStateDirective,
    NgComponentOutlet,
  ],
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
  private readonly _actionToolbarMenuOpen = signal(false);

  protected readonly popoverId = UUID.randomUUID();
  protected readonly hasGutterColumn = computed(() => this.withGutterColumn() ?? (!!this.subMenuItem().filter || hasGutter(this.menuItems())));
  protected readonly menuItems = this.computeMenuItems();
  protected readonly actionsPopoverAnchor = viewChild.required('actions_popover_anchor', {read: ViewContainerRef});
  protected readonly activeSubMenuItem = linkedSignal<MSubMenuItem | MMenuGroup, MSubMenuItem | null>({
    source: this.subMenuItem,  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  protected readonly isGroup = computed(() => this.subMenuItem().type === 'group');
  protected readonly isGroupExpanded = signal(true);

  constructor() {
    // Compute expanded state group.
    effect(() => {
      const subMenuItem = this.subMenuItem();
      const filterActive = this._filter.filterActive();
      untracked(() => {
        if (subMenuItem.type === 'group') {
          this.isGroupExpanded.set(filterActive || !subMenuItem.collapsible || !subMenuItem.collapsible.collapsed);
        }
        else {
          this.isGroupExpanded.set(true);
        }
      });
    });

    // Close action menu when this component is re-used.
    effect(() => {
      this.subMenuItem();

      untracked(() => {
        const popover = this._host.appendChild(this._document.createElement('div'));
        popover.setAttribute('popover', '');
        popover.style.setProperty('display', 'none');
        popover.showPopover();
        popover.remove();
      });
    })

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
  }

  protected onSelect(menuItem: MMenuItem): void {
    // Close the popup if the callback returns true. Defaults to closing non-checkable menu items.
    if (menuItem.onSelect() ?? menuItem.checked?.() === undefined) {
      this.close();
    }
  }

  protected onGroupToggle(): void {
    this.isGroupExpanded.update(expanded => !expanded);
  }

  protected onMenuItemMouseEnter(menuItem: MMenuItem | MSubMenuItem | MMenuGroup): void {
    this.activeSubMenuItem.set(menuItem.type === 'sub-menu-item' ? menuItem : null);

    // Create and display "fake" popover to close popover of other groups or menus.
    if (!this.activeSubMenuItem() && !this._actionToolbarMenuOpen()) {
      const popover = this._host.appendChild(this._document.createElement('div'));
      popover.setAttribute('popover', '');
      popover.style.setProperty('display', 'none');
      popover.showPopover();
      popover.remove();
    }
  }

  protected onTogglePopover(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      this.activeSubMenuItem.set(null);
    }
  }

  protected onFilterChange(filter: string): void {
    this._filter.setFilter(filter);
  }

  protected onActionToolbarMenuOpen(open: boolean): void {
    this._actionToolbarMenuOpen.set(open);
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
    return computed(() => {
      switch (menuItem.type) {
        case 'menu-item':
          return this._filter.matches(menuItem)();
        case 'sub-menu-item':
          return menuItem.children.some(child => this.matchesFilter(child)()); // TODO [menu] consider contributions
        case 'group':
          return menuItem.children.some(child => this.matchesFilter(child)()); // TODO [menu] consider contributions
      }
    });
  }

  private close(): void {
    const popover = this._document.documentElement.appendChild(this._document.createElement('div'));
    popover.setAttribute('popover', '');
    popover.style.setProperty('display', 'none');
    popover.showPopover();
    popover.remove();
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
