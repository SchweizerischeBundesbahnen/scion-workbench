import {Component, computed, DOCUMENT, effect, ElementRef, inject, input, linkedSignal, Signal, viewChild} from '@angular/core';
import {SciMenuRegistry} from '../../menu.registry';
import {MMenuGroup, MMenuItem, MSubMenuItem} from '../../ɵmenu';
import {MenuComponent} from '../../menu/menu.component';
import {UUID} from '@scion/toolkit/uuid';
import {ActiveMenuTracker, ActiveMenuTrackerDirective} from './active-menu-tracker';

@Component({
  selector: 'sci-tool-group',
  templateUrl: './tool-group.component.html',
  styleUrl: './tool-group.component.scss',
  imports: [
    MenuComponent,
    ActiveMenuTrackerDirective,
  ],
})
export class SciToolGroupComponent {

  public readonly subMenuItem = input.required<string | MMenuGroup>();
  public readonly disabled = input<boolean>();

  private readonly _menuRegistry = inject(SciMenuRegistry);
  private readonly _popover = viewChild('popover', {read: ElementRef<HTMLElement>});
  private readonly _activeMenuTracker = inject(ActiveMenuTracker);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);

  protected readonly popoverId = UUID.randomUUID();
  protected readonly menuItems = this.computeMenuItems();
  protected readonly activeSubMenuItem = linkedSignal<string | MMenuGroup, MSubMenuItem | undefined>({
    source: this.subMenuItem,  // reset active sub menu item when this component is re-used
    computation: () => undefined,
  });

  constructor() {
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
      if (typeof subMenuItem === 'string') {
        return this._menuRegistry.findMenuContributions(subMenuItem).flatMap(m => m.menuItems);
      }

      // TODO [MENU] Sort by order (e.g., after, before)
      return subMenuItem.children.concat(this._menuRegistry.findMenuContributions(subMenuItem.id).flatMap(m => m.menuItems))
    });
  }

  protected onMenuItemMouseEnter(menuItem: MMenuItem | MSubMenuItem | MMenuGroup): void {
    // Open menu only if already opened a submenu, i.e., after a previous click.
    if (menuItem.type === 'sub-menu-item' && !this._activeMenuTracker.hasActiveMenu()) {
      return;
    }

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

  protected onSubMenuClick(subMenuItem: MSubMenuItem): void {
    this.activeSubMenuItem.set(subMenuItem);
  }

  protected onTogglePopover(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      this.activeSubMenuItem.set(undefined);
    }
  }
}

