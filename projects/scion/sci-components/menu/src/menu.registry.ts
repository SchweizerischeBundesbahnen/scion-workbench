import {Injectable} from '@angular/core';
import {ɵSciMenu} from './ɵmenu';
import {Maps} from '@scion/toolkit/util';

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
