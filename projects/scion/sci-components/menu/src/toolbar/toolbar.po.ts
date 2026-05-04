import {ComponentFixture} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {SciToolbarComponent} from '@scion/sci-components/menu';
import {MenuPO} from '../menu/menu.po';

export class ToolbarPO {

  private readonly _toolbar: DebugElement;
  private readonly _group: DebugElement;

  constructor(private _fixture: ComponentFixture<unknown>, name: string) {
    this._toolbar = this._fixture.debugElement.queryAll(By.directive(SciToolbarComponent)).find(toolbar => toolbar.componentInstance.name() === name)!;
    this._group = this._toolbar.query(By.css('sci-toolbar-group'));
  }

  public get debugElement(): DebugElement {
    return this._toolbar;
  }

  public get nativeElement(): HTMLElement {
    return this._toolbar.nativeElement;
  }

  public get items(): Array<MenuItemPO | MenuGroupPO> {
    return this._group.children
      // .filter(child => child.nativeElement.classList.contains('e2e-menu-item'))
      .map(item => {
        if (item.name === 'sci-toolbar-group') {
          return new MenuGroupPO(item);
        }
        else {
          return new MenuItemPO(item);
        }
      });
  }

  // public get groups(): MenuGroupPO[] {
  //   return this._menu.children
  //     .filter(child => child.nativeElement.classList.contains('e2e-menu-group'))
  //     .map(group => new MenuGroupPO(this.submenu, group));
  // }

  public item(locateBy: {cssClass: string}): MenuItemPO | MenuGroupPO {
    return this.items.find(item => item.nativeElement.classList.contains(locateBy.cssClass))!;
  }

  public openMenu(locateBy: {cssClass: string}): MenuPO {
    // Click on menu item.
    this.item(locateBy).nativeElement.click();

    // Return menu.
    return new MenuPO(this._fixture);
  }

  // public group(locateBy: {cssClass: string}): MenuGroupPO {
  //   return this.groups.find(group => group.nativeElement.classList.contains(locateBy.cssClass))!;
  // }

  // public async openMenu(locateBy: {cssClass: string}): Promise<MenuPO> {
  //   // Get menu item.
  //   const menuItem = this.item(locateBy);
  //
  //   // Simulate 'hover' to open submenu.
  //   menuItem.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
  //
  //   // Wait until fixture stable.
  //   await this._fixture.whenStable();
  //
  //   // Return submenu.
  //   return this.submenu;
  // }
}

export class MenuItemPO {

  constructor(private _menuItem: DebugElement) {
  }

  public get debugElement(): DebugElement {
    return this._menuItem;
  }

  public get nativeElement(): HTMLButtonElement {
    return this._menuItem.nativeElement;
  }
}

export class MenuGroupPO {

  constructor(private _menuGroup: DebugElement) {
  }

  public get debugElement(): DebugElement {
    return this._menuGroup;
  }

  public get nativeElement(): HTMLElement {
    return this._menuGroup.nativeElement;
  }

  // public get header(): DebugElement {
  //   return this._menuGroup.query(By.css('button.e2e-group-header'));
  // }

  public get items(): Array<MenuItemPO | MenuGroupPO> {
    return this._menuGroup.children
      .filter(child => child.nativeElement.classList.contains('e2e-menu-item'))
      .map(item => {
        if (item.nativeElement.tagName === 'button') {
          return new MenuItemPO(item);
        }
        else {
          return new MenuGroupPO(item);
        }
      });
  }
}
