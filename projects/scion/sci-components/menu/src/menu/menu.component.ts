import {afterRenderEffect, ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, forwardRef, inject, Injector, input, linkedSignal, runInInjectionContext, signal, Signal, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {FormatAcceleratorPipe} from './accelerator-format.pipe';
import {MenuItemGroupComponent} from './menu-group.component';
import {MenuFilterComponent} from './menu-filter.component';
import {MenuFilter} from './menu-filter.service';
import {SciToolbarComponent} from '../toolbar/toolbar.component';
import {ToolbarStateDirective} from '../toolbar/toolbar-state.directive';
import {MenuItemStateDirective} from './menu-item-state.directive';
import {NgComponentOutlet} from '@angular/common';
import {SciMenuContribution, SciMenuGroupContribution, SciMenuItemContribution} from '../menu-contribution.model';
import {SciMenuService} from '../menu.service';

/**
 * Represents a menu or a group of menu items.
 */
@Component({
  selector: 'sci-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormatAcceleratorPipe,
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
    '[class.is-group]': '!!group()',
    '[style.width]': 'size()?.width',
    '[style.min-width]': 'size()?.minWidth',
    '[style.max-width]': 'size()?.maxWidth',
    '[class]': 'cssClass()',
  },
})
export class MenuComponent {

  public readonly name = input.required<Array<`menu:${string}` | `group:${string}`>>();
  public readonly context = input.required<Map<string, unknown>>();
  public readonly disabled = input<boolean>();
  public readonly filter = input<boolean | {placeholder?: string; notFoundText?: string}>(false);
  public readonly group = input<{label?: string, collapsible: boolean, collapsed: boolean}>();
  public readonly sizeInput = input<{width?: string; minWidth?: string; maxWidth?: string}>();
  public readonly glyphArea = input<boolean>();
  public readonly anchorWidth = input(undefined, {transform: (width: number | undefined): string | undefined => width ? `${width}px` : undefined});
  public readonly cssClass = input<string[]>();

  private readonly _menuService = inject(SciMenuService);
  private readonly _menuFilter = inject(MenuFilter);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _injector = inject(Injector);
  private readonly _actionToolbarMenuOpen = signal(false);

  protected readonly hasGlyphArea = computed(() => this.glyphArea() ?? this.requiresGlyphArea());
  protected readonly menuItems = this.computeMenuItems();
  protected readonly popoverAnchor = viewChild.required('popover_anchor', {read: ViewContainerRef});
  protected readonly activeSubMenuItem = linkedSignal<{name: Array<`menu:${string}` | `group:${string}`>; context: Map<string, unknown> | undefined}, {menu: SciMenuContribution, element: HTMLElement} | null>({
    source: computed(() => ({name: this.name(), context: this.context()})),  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  protected readonly isGroupExpanded = linkedSignal(() => {
    const group = this.group();

    if (!group) {
      return true;
    }

    return this._menuFilter.filterActive() || !group.collapsible || !group.collapsed;
  });

  protected readonly size = linkedSignal<PreferredSize | undefined>(() => {
    if (this.group()) {
      return undefined;
    }

    const preferredMinWidth = this.sizeInput()?.minWidth ?? '12em';
    return {
      width: this.sizeInput()?.width,
      minWidth: this.anchorWidth() ? `max(${preferredMinWidth}, ${this.anchorWidth()})` : preferredMinWidth,
      maxWidth: this.sizeInput()?.maxWidth ?? '24em',
    };
  });

  constructor() {
    // Maintain stable width when expanding/collapsing groups or hovering menu item when displaying the actions toolbar.
    afterRenderEffect(() => {
      this.name(); // re-evaluate when re-used
      this.context();
      this.size.update(size => ({...size, width: `${this._host.getBoundingClientRect().width}px`}));
    });

    // Close action menu when this component is re-used.
    effect(() => {
      this.name();
      this.context();

      untracked(() => {
        const popover = this._host.appendChild(this._document.createElement('div'));
        popover.setAttribute('popover', '');
        popover.style.setProperty('display', 'none');
        popover.showPopover();
        popover.remove();
      });
    })

    // Open popover when hovering over a submenu item, or hide it otherwise.
    effect((onCleanup) => {
      const activeSubMenuItem = this.activeSubMenuItem();
      untracked(() => {
        if (activeSubMenuItem) {
          const ref = this._menuService.open(activeSubMenuItem.menu.name, {
            anchor: activeSubMenuItem.element,
            context: this.context(),
            viewContainerRef: this.popoverAnchor(),
            cssClass: activeSubMenuItem.menu.cssClass,
            filter: activeSubMenuItem.menu.menu.filter,
            align: 'horizontal',
          });
          ref.onClose(() => {
            // do not close other menu
            this.activeSubMenuItem.update(it => it === activeSubMenuItem ? null : it);
          });
          onCleanup(() => ref.close());
        }
      });
    });
  }

  protected onSelect(menuItem: SciMenuItemContribution): void {
    runInInjectionContext(this._injector, () => {
      if (menuItem.onSelect(this.context())) {
        this.close();
      }
    });
  }

  protected onGroupToggle(): void {
    this.isGroupExpanded.update(expanded => !expanded);
  }

  protected onMenuItemMouseEnter(menuItem: {menu: SciMenuContribution, element: HTMLElement} | null): void {
    this.activeSubMenuItem.set(menuItem);

    // Create and display "fake" popover to close popover when hovering menu items of other groups.
    if (!this.activeSubMenuItem() && !this._actionToolbarMenuOpen()) {
      const popover = this._host.appendChild(this._document.createElement('div'));
      popover.setAttribute('popover', '');
      popover.style.setProperty('display', 'none');
      popover.showPopover();
      popover.remove();
    }
  }

  protected onFilterChange(filter: string): void {
    this._menuFilter.setFilter(filter);
  }

  protected onActionToolbarMenuOpen(open: boolean): void {
    this._actionToolbarMenuOpen.set(open);
  }

  private computeMenuItems(): Signal<Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>> {
    return computed(() => this._menuService.menuContributions(this.name(), this.context())().filter(menuItem => this.matchesFilter(menuItem)()));
  }

  private matchesFilter(menuItem: SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution): Signal<boolean> {
    return computed(() => {
      switch (menuItem.type) {
        case 'menu-item':
          return this._menuFilter.matches(menuItem)();
        case 'menu':
          return this._menuService.menuContributions(menuItem.name, this.context())().some(menuItem => this.matchesFilter(menuItem)());
        case 'group':
          return this._menuService.menuContributions(menuItem.name, this.context())().some(menuItem => this.matchesFilter(menuItem)());
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

  /**
   * Computes if a glyph area is needed for icons and checkmarks.
   *
   * A glyph area is required if any group needs one, even if the context does not.
   */
  private requiresGlyphArea(): boolean {
    const menuService = this._menuService;

    if (this.filter()) {
      return true;
    }

    return menuService.menuContributions(this.name(), this.context())().some(menuItem => {
      switch (menuItem.type) {
        case 'menu-item':
          return menuItem.icon?.() || menuItem.checked !== undefined;
        case 'menu':
          return menuItem.icon?.();
        case 'group':
          return menuItem.collapsible || requiresGlyphAreaRec(menuItem, this.context());
      }
    });

    function requiresGlyphAreaRec(contextElement: SciMenuGroupContribution, context: Map<string, unknown>): boolean {
      return menuService.menuContributions(contextElement.name, context)().some(menuItem => {
        switch (menuItem.type) {
          case 'menu-item':
            return menuItem.icon?.() || menuItem.checked !== undefined;
          case 'menu':
            return menuItem.icon?.();
          case 'group':
            return menuItem.collapsible || requiresGlyphAreaRec(menuItem, context);
        }
      });
    }
  }
}

interface PreferredSize {
  width?: string;
  minWidth?: string;
  maxWidth?: string
}
