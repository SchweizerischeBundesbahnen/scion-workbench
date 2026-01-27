import {Component, computed, effect, ElementRef, inject, input, signal, Signal, viewChild} from '@angular/core';
import {SciMenuRegistry} from '../menu.registry';
import {MMenuItem, MSubMenuItem} from '../ɵmenu';
import {NgComponentOutlet} from '@angular/common';
import {MenuComponent} from '../menu/menu.component';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'sci-toolbar-1',
  templateUrl: './toolbar1.component.html',
  styleUrl: './toolbar1.component.scss',
  imports: [
    NgComponentOutlet,
  ],
  host: {
    '[style.--anchor]': '`--${popoverId}`',
  },
})
export class SciToolbarComponent {

  public readonly name = input.required<string>();
  protected readonly popoverId = UUID.randomUUID();
  private readonly _menuRegistry = inject(SciMenuRegistry);
  protected readonly _popover = viewChild<ElementRef<HTMLElement>>('popover');

  protected readonly MenuComponent = MenuComponent;
  protected readonly menuItems = this.getMenuItems();
  protected readonly activeSubMenuItem = signal<MSubMenuItem | undefined>(undefined);

  constructor() {
    effect(() => {
      const popover = this._popover();
      if (!popover) {
        return;
      }

      if (!this.activeSubMenuItem()) {
        popover.nativeElement.hidePopover();
      }
    });
  }

  private getMenuItems(): Signal<Array<MMenuItem | MSubMenuItem>> {
    return computed(() => {
      const menus = this._menuRegistry.findMenuContributions(this.name());
      return menus.flatMap(menu => menu.menuItems);
    });
  }

  protected onSubMenuMouseEnter(subMenuItem: MSubMenuItem): void {
    if (!this.activeSubMenuItem()) {
      return;
    }
    this.activeSubMenuItem.set(subMenuItem);
  }

  protected onSubMenuClick(subMenuItem: MSubMenuItem): void {
    this.activeSubMenuItem.set(subMenuItem);
  }

  protected onToggle(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      this.activeSubMenuItem.set(undefined);
    }
  }
}

