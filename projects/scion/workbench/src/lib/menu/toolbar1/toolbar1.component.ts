import {Component, computed, inject, input, Signal} from '@angular/core';
import {SciMenuRegistry} from '../menu.registry';
import {MMenuItem, MSubMenuItem} from '../ɵmenu';
import {MenuService} from '../menu.service';

@Component({
  selector: 'sci-toolbar-1',
  templateUrl: './toolbar1.component.html',
  styleUrl: './toolbar1.component.scss',
})
export class SciToolbarComponent {

  public readonly name = input.required<string>();

  private readonly _menuRegistry = inject(SciMenuRegistry);
  private readonly _menuService = inject(MenuService);

  protected readonly menuItems = this.getMenuItems();

  private getMenuItems(): Signal<Array<MMenuItem | MSubMenuItem>> {
    return computed(() => {
      const menus = this._menuRegistry.findMenuContributions(this.name());
      return menus.flatMap(menu => menu.menuItems);
    });
  }

  protected onMenuOpen(anchor: Element, menuItem: MSubMenuItem): void {
    this._menuService.open(anchor as HTMLElement, menuItem, {rootMenu: true});
  }
}

