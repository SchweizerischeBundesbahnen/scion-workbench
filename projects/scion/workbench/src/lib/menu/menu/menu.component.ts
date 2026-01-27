import {Component, inject, InjectionToken} from '@angular/core';
import {MMenuItem, MSubMenuItem} from '../ɵmenu';
import {SciMenuRegistry} from '../menu.registry';
import {MenuService} from '../menu.service';

export const SUBMENU_ITEM = new InjectionToken<MSubMenuItem>('SUBMENU_ITEM');

@Component({
  selector: 'wb-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {

  private readonly _menuService = inject(MenuService);
  protected readonly menuItems = getMenuItems();

  protected onMenuOpen(anchor: Element, menuItem: MSubMenuItem): void {
    this._menuService.open(anchor as HTMLElement, menuItem, {rootMenu: false});
  }
}

function getMenuItems(): Array<MMenuItem | MSubMenuItem> {
  const subMenu = inject(SUBMENU_ITEM);
  const menuRegistry = inject(SciMenuRegistry);
  return [
    ...subMenu.children,
    ...menuRegistry.findMenuContributions(subMenu.id).flatMap(m => m.menuItems),
  ];
}
