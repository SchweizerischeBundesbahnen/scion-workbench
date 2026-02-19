import {afterRenderEffect, ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, forwardRef, inject, input, linkedSignal, signal, Signal, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {SciMenuGroup, SciMenuItem, SciSubMenuItem} from '../ɵmenu';
import {SciMenuRegistry} from '../menu.registry';
import {UUID} from '@scion/toolkit/uuid';
import {JoinPipe} from './join.pipe';
import {MenuItemGroupComponent} from './menu-group.component';
import {MenuFilterComponent} from './menu-filter.component';
import {MenuFilter} from './menu-filter.service';
import {SciToolbarComponent} from '../toolbar/toolbar.component';
import {ToolbarStateDirective} from '../toolbar/toolbar-state.directive';
import {MenuItemStateDirective} from './menu-item-state.directive';
import {NgComponentOutlet} from '@angular/common';

/**
 * Represents a menu or a group of menu items.
 */
@Component({
  selector: 'sci-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JoinPipe,
    MenuItemGroupComponent,
    MenuFilterComponent,
    forwardRef(() => SciToolbarComponent),
    ToolbarStateDirective,
    MenuItemStateDirective,
    NgComponentOutlet,
  ],
  providers: [
    MenuFilter,
  ],
  host: {
    '[class.no-glyph-area]': '!hasGlyphArea()',
    '[class.is-group]': 'isGroup()',
    '[style.width]': 'size()?.width',
    '[style.min-width]': 'size()?.minWidth',
    '[style.max-width]': 'size()?.maxWidth',
  },
})
export class MenuComponent {

  public readonly contextElement = input.required<SciSubMenuItem | SciMenuGroup>();
  public readonly disabled = input<boolean>();
  public readonly glyphArea = input<boolean>();
  public readonly anchorWidth = input(undefined, {transform: (width: number | undefined): string | undefined => width ? `${width}px` : undefined});

  private readonly _menuRegistry = inject(SciMenuRegistry);
  private readonly _popover = viewChild('popover', {read: ElementRef<HTMLElement>});
  private readonly _menuFilter = inject(MenuFilter);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _actionToolbarMenuOpen = signal(false);

  protected readonly popoverId = UUID.randomUUID();
  protected readonly hasGlyphArea = computed(() => this.glyphArea() ?? requiresGlyphArea(this.contextElement())());
  protected readonly menuItems = this.computeMenuItems();
  protected readonly actionsPopoverAnchor = viewChild.required('actions_popover_anchor', {read: ViewContainerRef});
  protected readonly activeSubMenuItem = linkedSignal<SciSubMenuItem | SciMenuGroup, SciSubMenuItem | null>({
    source: this.contextElement,  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  protected readonly isGroup = computed(() => this.contextElement().type === 'group');
  protected readonly isGroupExpanded = linkedSignal(() => {
    const contextElement = this.contextElement();
    const group = contextElement.type == 'group' ? contextElement : null;
    if (!group) {
      return true;
    }

    return this._menuFilter.filterActive() || !group.collapsible || !group.collapsible.collapsed;
  });

  protected readonly size = linkedSignal<PreferredSize | undefined>(() => {
    const subMenuItem = this.contextElement();
    if (subMenuItem.type !== 'sub-menu-item') {
      return undefined;
    }

    const preferredMinWidth = subMenuItem.size?.minWidth ?? '12em';
    return {
      width: subMenuItem.size?.width,
      minWidth: this.anchorWidth() ? `max(${preferredMinWidth}, ${this.anchorWidth()})` : preferredMinWidth,
      maxWidth: subMenuItem.size?.maxWidth ?? '24em',
    };
  });

  constructor() {
    // Maintain stable width when expanding/collapsing groups or hovering menu item when displaying the actions toolbar.
    afterRenderEffect(() => {
      this.contextElement(); // re-evaluate when re-used
      this.size.update(size => ({...size, width: `${this._host.getBoundingClientRect().width}px`}));
    });

    // Close action menu when this component is re-used.
    effect(() => {
      this.contextElement();

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

  protected onSelect(menuItem: SciMenuItem): void {
    // Close the popup if the callback returns true. Defaults to closing non-checkable menu items.
    if (menuItem.onSelect() ?? menuItem.checked?.() === undefined) {
      this.close();
    }
  }

  protected onGroupToggle(): void {
    this.isGroupExpanded.update(expanded => !expanded);
  }

  protected onMenuItemMouseEnter(menuItem: SciMenuItem | SciSubMenuItem | SciMenuGroup): void {
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
    this._menuFilter.setFilter(filter);
  }

  protected onActionToolbarMenuOpen(open: boolean): void {
    this._actionToolbarMenuOpen.set(open);
  }

  private computeMenuItems(): Signal<Array<SciMenuItem | SciSubMenuItem | SciMenuGroup>> {
    return computed(() => {
      const subMenuItem = this.contextElement();

      // TODO [MENU] Sort by order (e.g., after, before)
      return subMenuItem.children
        .concat(this._menuRegistry.findMenuContributions(subMenuItem.id).flatMap(m => m.menuItems))
        .filter(menuItem => this.matchesFilter(menuItem)());
    });
  }

  private matchesFilter(menuItem: SciMenuItem | SciSubMenuItem | SciMenuGroup): Signal<boolean> {
    return computed(() => {
      switch (menuItem.type) {
        case 'menu-item':
          return this._menuFilter.matches(menuItem)();
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

/**
 * Computes if a glyph area is needed for icons and checkmarks.
 *
 * A glyph area is required if any group needs one, even if the context does not.
 */
function requiresGlyphArea(contextElement: SciSubMenuItem | SciMenuGroup): Signal<boolean> {
  return computed(() => {
    if (contextElement.filter) {
      return true;
    }

    return contextElement.children.some(menuItem => {
      switch (menuItem.type) {
        case 'menu-item':
          return menuItem.icon?.() || menuItem.checked !== undefined;
        case 'sub-menu-item':
          return menuItem.icon?.();
        case 'group':
          return menuItem.collapsible || requiresGlyphArea(menuItem)();
      }
    });
  });
}

interface PreferredSize {
  width?: string;
  minWidth?: string;
  maxWidth?: string
}
