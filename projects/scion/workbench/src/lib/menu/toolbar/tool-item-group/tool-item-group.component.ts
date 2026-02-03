import {Component, computed, effect, ElementRef, inject, input, linkedSignal, Signal, viewChild} from '@angular/core';
import {SciMenuRegistry} from '../../menu.registry';
import {MMenuGroup, MMenuItem, MSubMenuItem} from '../../ɵmenu';
import {MenuComponent} from '../../menu/menu.component';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'sci-tool-item-group',
  templateUrl: './tool-item-group.component.html',
  styleUrl: './tool-item-group.component.scss',
  imports: [
    MenuComponent,
  ],
})
export class SciToolGroupComponent {

  public readonly subMenuItem = input.required<string | MMenuGroup>();
  public readonly disabled = input<boolean>();

  private readonly _menuRegistry = inject(SciMenuRegistry);
  private readonly _popover = viewChild('popover', {read: ElementRef<HTMLElement>});

  protected readonly popoverId = UUID.randomUUID();
  protected readonly menuItems = this.computeMenuItems();
  protected readonly activeSubMenuItem = linkedSignal<string | MMenuGroup, MSubMenuItem | null>({
    source: this.subMenuItem,  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  constructor() {
    // Open popover when hovering over a submenu item, or hide it otherwise.
    effect(() => {
      const popover = this._popover();

      if (this.activeSubMenuItem()) {
        console.log('>>> show');
        popover?.nativeElement.showPopover();
      }
      else {
        console.log('>>> hide');
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

  protected onSubMenuClick(subMenuItem: MSubMenuItem): void {
    this.activeSubMenuItem.update(activeSubMenuItem => activeSubMenuItem === subMenuItem ? null : subMenuItem);
  }

  protected onTogglePopover(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      this.activeSubMenuItem.set(null);
    }
  }
}

