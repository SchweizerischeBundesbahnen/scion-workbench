import {afterRenderEffect, ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, inject, Injector, input, linkedSignal, runInInjectionContext, signal, Signal, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {FormatAcceleratorPipe} from './accelerator-format.pipe';
import {MenuItemGroupComponent} from './menu-group.component';
import {MenuFilterComponent} from './menu-filter.component';
import {MenuFilter} from './menu-filter.service';
import {ToolbarStateDirective} from '../toolbar/toolbar-state.directive';
import {NgComponentOutlet, NgTemplateOutlet} from '@angular/common';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '../menu.model';
import {ɵSciMenuService} from '../ɵmenu.service';
import {SciToolGroupComponent} from '../toolbar/toolbar-group.component';
import {NULL_MENU_CONTRIBUTIONS} from '../menu-contribution.model';
import {SciViewportComponent} from '@scion/components/viewport';
import {concat, fromEvent, map, NEVER, of, switchMap, timer} from 'rxjs';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {SciTextPipe, Translatable} from '@scion/sci-components/text';
import {RequireOne} from '@scion/sci-components/common';

/**
 * Represents a menu or a group of menu items.
 *
 * TODO This component is not reused anymore, thus remove comments below.
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
    SciToolGroupComponent,
    ToolbarStateDirective,
    NgComponentOutlet,
    SciViewportComponent,
    NgTemplateOutlet,
    SciTextPipe,
  ],
  providers: [
    MenuFilter,
  ],
  host: {
    '[class.no-glyph-area]': '!hasGlyphArea()',
    '[class.is-group]': '!!group()',
    '[style.width]': 'size()?.width ?? \'var(--sci-workbench-contextmenu-width)\'',
    '[style.min-width]': 'size()?.minWidth',
    '[style.max-width]': 'size()?.maxWidth ?? \'var(--sci-workbench-contextmenu-width)\'',
    '[style.--ɵmenu-max-height]': 'size()?.maxHeight',
    '[style.--ɵmenu-scrolling]': 'scrolling() ? `true` : null',
    '[class]': 'cssClass()',
  },
})
export class MenuComponent {

  public readonly type = input.required<'menu' | 'group'>();
  public readonly menuItems = input.required<Array<SciMenuItem | SciMenu | SciMenuGroup>>();
  public readonly disabled = input<boolean>();
  public readonly filter = input<{placeholder?: Signal<Translatable>; notFoundText?: Signal<Translatable>}>();
  public readonly group = input<{label?: string, collapsible: boolean, collapsed: boolean}>();
  public readonly sizeInput = input<{width?: string; minWidth?: string; maxWidth?: string; maxHeight?: string}>();
  public readonly glyphArea = input<boolean>();
  public readonly anchorWidth = input(undefined, {transform: (width: number | undefined): string | undefined => width ? `${width}px` : undefined});
  public readonly cssClass = input<string[]>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _menuFilter = inject(MenuFilter);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _injector = inject(Injector);
  private readonly _actionToolbarMenuOpen = signal(false);

  protected readonly hasGlyphArea = computed(() => this.glyphArea() ?? (!!this.filter() || requiresGlyphArea(this.menuItems())));
  protected readonly menuItemsFiltered = computed(() => this.menuItems().filter(menuItem => this.matchesFilter(menuItem)()));
  protected readonly popoverAnchor = viewChild.required('popover_anchor', {read: ViewContainerRef});
  protected readonly viewport = viewChild(SciViewportComponent);
  protected readonly scrolling = this.computeScrolling();
  protected readonly activeSubMenuItem = linkedSignal<SciMenuItemLike[], {menu: SciMenu, element: HTMLElement} | null>({
    source: this.menuItems,  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  protected readonly NULL_MENU_CONTRIBUTION = NULL_MENU_CONTRIBUTIONS;

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
      maxWidth: this.sizeInput()?.maxWidth ?? this.sizeInput()?.width,
      maxHeight: this.sizeInput()?.maxHeight,
    };
  });

  constructor() {
    // Maintain stable width when expanding/collapsing groups or hovering menu item when displaying the actions toolbar.
    afterRenderEffect(() => {
      if (this.menuItems().length) { // capture initial width only when having menu items.
        this.size.update(size => ({...size, width: `${this._host.getBoundingClientRect().width}px`}));
      }
    });

    // Close action menu when this component is re-used.
    effect(() => {
      this.menuItems();

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
          const ref = this._menuService.open(activeSubMenuItem.menu.children, {
            anchor: activeSubMenuItem.element,
            viewContainerRef: this.popoverAnchor(),
            cssClass: activeSubMenuItem.menu.cssClass,
            filter: activeSubMenuItem.menu.menu.filter as RequireOne<{placeholder?: Signal<Translatable>; notFoundText?: Signal<Translatable>}> | undefined,
            size: {
              width: activeSubMenuItem.menu.menu.width,
              minWidth: activeSubMenuItem.menu.menu.minWidth,
              maxWidth: activeSubMenuItem.menu.menu.maxWidth,
              maxHeight: activeSubMenuItem.menu.menu.maxHeight,
            },
            align: 'horizontal',
            focus: false,
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

  protected onSelect(menuItem: SciMenuItem): void {
    // TODO [menu] Disable during action until promise resolved.
    void runInInjectionContext(this._injector, async () => {
      if (await menuItem.onSelect()) {
        this.close();
      }
    });
  }

  protected onGroupToggle(): void {
    this.isGroupExpanded.update(expanded => !expanded);
  }

  protected onMenuItemMouseEnter(menuItem: {menu: SciMenu, element: HTMLElement} | null): void {
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

  private computeScrolling(): Signal<boolean> {
    return toSignal(toObservable(this.viewport)
      .pipe(
        switchMap(viewport => viewport ? fromEvent(viewport.viewportElement, 'scroll') : NEVER),
        switchMap(() => concat(of(true), timer(150).pipe(map(() => false)))),
      ), {initialValue: false});
  }

  private matchesFilter(menuItem: SciMenuItem | SciMenu | SciMenuGroup): Signal<boolean> {
    return computed(() => {
      if (!this._menuFilter.filterActive()) {
        return true;
      }
      switch (menuItem.type) {
        case 'menu-item':
          return this._menuFilter.matches(menuItem)();
        case 'menu':
          return menuItem.children.some(menuItem => this.matchesFilter(menuItem)());
        case 'group':
          return menuItem.children.some(menuItem => this.matchesFilter(menuItem)());
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
function requiresGlyphArea(menuItems: SciMenuItemLike[]): boolean {
  return menuItems.some(menuItem => {
    switch (menuItem.type) {
      case 'menu-item':
        return !!menuItem.iconLigature || !!menuItem.iconComponent || !!menuItem.checked;
      case 'menu':
        return !!menuItem.iconLigature || !!menuItem.iconComponent;
      case 'group':
        return menuItem.collapsible || requiresGlyphArea(menuItem.children);
    }
  });
}

interface PreferredSize {
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
}
