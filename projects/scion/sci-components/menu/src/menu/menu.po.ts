import {ComponentFixture} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

export class MenuPO {

  private readonly _filterInput: HTMLInputElement | undefined;

  constructor(private _fixture: ComponentFixture<unknown>, private _menu?: () => DebugElement) {
    this._filterInput = this.menu?.query(By.css('input.e2e-menu-filter-input'))?.nativeElement as HTMLInputElement | undefined;
  }

  public get menu(): DebugElement {
    return this._menu ? this._menu() : (this._fixture.debugElement.parent!.query(By.css('sci-menu')))!;
  }

  public get debugElement(): DebugElement {
    return this.menu;
  }

  public get nativeElement(): HTMLElement {
    return this.menu.nativeElement;
  }

  public get submenu(): MenuPO {
    return new MenuPO(this._fixture, () => this.menu.query(By.css('sci-menu')));
  }

  public get items(): Array<MenuItemPO | MenuGroupPO> {
    return this.menu.children
      .filter(child => child.nativeElement.classList.contains('e2e-menu-item'))
      .map(item => {
        if (item.name === 'button') {
          return new MenuItemPO(this.submenu, item);
        }
        else {
          return new MenuGroupPO(this.submenu, item);
        }
      });
  }

  public get groups(): MenuGroupPO[] {
    return this.menu.children
      .filter(child => child.nativeElement.classList.contains('e2e-menu-group'))
      .map(group => new MenuGroupPO(this.submenu, group));
  }

  public item(locateBy: {cssClass: string}): MenuItemPO | MenuGroupPO {
    return this.items.find(item => item.nativeElement.classList.contains(locateBy.cssClass))!;
  }

  public group(locateBy: {cssClass: string}): MenuGroupPO {
    return this.groups.find(group => group.nativeElement.classList.contains(locateBy.cssClass))!;
  }

  public async openSubMenu(locateBy: {cssClass: string}): Promise<MenuPO> {
    // Get menu item.
    const menuItem = this.item(locateBy);

    // Simulate 'hover' to open submenu.
    menuItem.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

    // Wait until fixture stable.
    await this._fixture.whenStable();

    // Return submenu.
    return this.submenu;
  }

  public filterMenuItems(filterText: string): void {
    this._filterInput!.value = filterText;
    this._filterInput!.dispatchEvent(new Event('input'));
    this._fixture.detectChanges();
  }
}

export class MenuItemPO {

  constructor(private _submenu: MenuPO, private _debugElement: DebugElement) {
  }

  public get subMenu(): MenuPO {
    return this._submenu;
  }

  public get debugElement(): DebugElement {
    return this._debugElement;
  }

  public get nativeElement(): HTMLButtonElement {
    return this._debugElement.nativeElement;
  }

  public get iconLigature(): string {
    return this.debugElement.query(By.css('sci-icon')).nativeElement.textContent;
  }

  public iconComponent(selector: string): DebugElement {
    return this.debugElement.query(By.css('span.icon')).query(By.css(selector));
  }

  public get labelText(): string {
    return this.debugElement.query(By.css('span.label')).nativeElement.textContent;
  }

  public labelComponent(selector: string): DebugElement {
    return this.debugElement.query(By.css('span.label')).query(By.css(selector));
  }

  public get checked(): boolean {
    return this.nativeElement.classList.contains('checked');
  }

  public get active(): boolean {
    return this.nativeElement.classList.contains('active');
  }
}

export class MenuGroupPO {

  constructor(private _subMenu: MenuPO, private _debugElement: DebugElement) {
  }

  public get debugElement(): DebugElement {
    return this._debugElement;
  }

  public get nativeElement(): HTMLElement {
    return this._debugElement.nativeElement;
  }

  public get header(): DebugElement {
    return this._debugElement.query(By.css('button.e2e-group-header'));
  }

  public get items(): Array<MenuItemPO | MenuGroupPO> {
    return this._debugElement.children
      .filter(child => child.nativeElement.classList.contains('e2e-menu-item'))
      .map(item => {
        if (item.name === 'button') {
          return new MenuItemPO(this._subMenu, item);
        }
        else {
          return new MenuGroupPO(this._subMenu, item);
        }
      });
  }

  public get label(): string {
    const groupHeader = this._debugElement.query(By.css('header.group-header'));
    const nativeElement = (groupHeader ?? this._debugElement.query(By.css('button.group-header')).query(By.css('span.label'))).nativeElement;
    return nativeElement.textContent;
  }
}
