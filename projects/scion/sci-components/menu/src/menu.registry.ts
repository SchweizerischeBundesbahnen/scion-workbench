import {Injectable} from '@angular/core';
import {ɵSciMenu} from './ɵmenu';
import {Maps} from '@scion/toolkit/util';
import {SciMenu} from '@scion/sci-components/menu';

@Injectable({providedIn: 'root'})
export class SciMenuRegistry {

  private readonly _menus = new Map<string, ɵSciMenu[]>;

  public registerMenu(name: string, menu: ɵSciMenu): void {
    Maps.addListValue(this._menus, name, menu);
  }

  public unregisterMenu(name: string, menu: ɵSciMenu): void {
    Maps.removeListValue(this._menus, name, menu);
  }

  public findMenuContributions(name: string): ɵSciMenu[] {
    return this._menus.get(name) ?? [];
  }
}

export interface ISciMenuRegistry {

  registerMenu(name: string, menu: SciMenu): void;

  get(name: string): SciMenu[];
}

// export class MenuRegistryProxy implements ISciMenuRegistry {

  // public registerMenu(name: string, menu: ɵSciMenu): void {
  //   menu.menuItems.forEach(menuItem => {
  //     if (menuItem.type === 'menu-item') {
  //       effect(() => {
  //         const disabled = menuItem.disabled()
  //         Beans.get(MessageClient).publish(`menus/${menuItem.id}/disabled`, true);
  //       });
  //     }
  //     else if (menuItem.type === 'sub-menu-item') {
  //
  //
  //
  //     }
  //   })
  //
  //
  //   Beans.get(MessageClient).onMessage('menus/:id/disabled', msg => {
  //
  //   });
  //
  //
  // }

//   public get(name: string): SciMenu[] {
//     throw new Error('Method not implemented.');
//   }
// }
