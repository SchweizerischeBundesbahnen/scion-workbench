import {ComponentFixture} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ToolbarGroupPO} from './toolbar.po';
import {OneOf} from '@scion/toolkit/types';

export class MenuPO {

  private readonly _selector: string;

  constructor(private _fixture: ComponentFixture<unknown>, private _locateBy?: OneOf<{cssClass?: string; selector?: string}>) {
    this._selector = (() => {
      if (this._locateBy?.selector) {
        return this._locateBy.selector;
      }
      if (this._locateBy?.cssClass) {
        return `sci-menu.${this._locateBy.cssClass}`;
      }
      return 'sci-menu';
    })();
  }

  public get debugElement(): DebugElement {
    return this._fixture.debugElement.parent!.query(By.css(this._selector));
  }

  public get nativeElement(): HTMLElement {
    return this.debugElement.nativeElement as HTMLElement;
  }

  public items(): Array<MenuItemPO | MenuGroupPO> {
    let itemIndex = 0;
    let groupIndex = 0;

    const viewport = this.debugElement.children.find(child => child.name === 'sci-viewport');
    const children = viewport?.children ?? this.debugElement.children;
    const selector = viewport ? `${this._selector} > sci-viewport` : this._selector;

    return children.reduce((acc, child) => {
      const nativeElement = child.nativeElement as HTMLElement;

      if (nativeElement.classList.contains('e2e-menu-item')) {
        acc.push(new MenuItemPO(this._fixture, `${selector} > :nth-child(${++itemIndex} of button.e2e-menu-item)`, {parentSelector: this._selector}));
      }
      else if (nativeElement.tagName === 'SCI-MENU-GROUP') {
        acc.push(new MenuGroupPO(this._fixture, `${selector} > :nth-child(${++groupIndex} of sci-menu-group)`));
      }
      return acc;
    }, new Array<MenuItemPO | MenuGroupPO>());
  }

  public item(locateBy: {cssClass: string}): MenuItemPO {
    return new MenuItemPO(this._fixture, `${this._selector} button.e2e-menu-item.${locateBy.cssClass}`, {parentSelector: this._selector});
  }

  public group(locateBy: {cssClass: string}): MenuGroupPO {
    return new MenuGroupPO(this._fixture, `${this._selector} sci-menu-group.${locateBy.cssClass}`);
  }

  public async openSubMenu(locateBy: {cssClass: string}): Promise<MenuPO> {
    // Get menu item.
    const menuItem = this.item(locateBy);

    // Simulate 'hover' to open submenu.
    menuItem.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

    // Wait until fixture stable.
    await this._fixture.whenStable();

    // Return submenu.
    return new MenuPO(this._fixture, {selector: `${this._selector} sci-menu.${locateBy.cssClass}`});
  }

  public get filterInputElement(): DebugElement | undefined {
    return this.debugElement.query(By.css('input.e2e-menu-filter-input'));
  }

  public filterMenuItems(filterText: string): void {
    const filterInput = this.filterInputElement!.nativeElement as HTMLInputElement;
    filterInput.value = filterText;
    filterInput.dispatchEvent(new Event('input'));
    this._fixture.detectChanges();
  }

  public get noItemsFoundMessage(): DebugElement | undefined {
    return this.debugElement.query(By.css('div.e2e-no-items'));
  }

  public get viewport(): DebugElement | undefined {
    return this.debugElement.query(By.css('sci-viewport'));
  }
}

export class MenuItemPO {

  constructor(private _fixture: ComponentFixture<unknown>, private _selector: string, private _context: {parentSelector: string}) {
  }

  public get subMenu(): MenuPO {
    return new MenuPO(this._fixture, {selector: `${this._context.parentSelector} sci-menu`});
  }

  public get debugElement(): DebugElement {
    return this._fixture.debugElement.parent!.query(By.css(this._selector));
  }

  public get nativeElement(): HTMLButtonElement {
    return this.debugElement.nativeElement as HTMLButtonElement;
  }

  public get icon(): string {
    return (this.debugElement.query(By.css('sci-icon')).nativeElement as HTMLElement).innerText;
  }

  public iconComponent(selector: string): DebugElement | undefined {
    return this.debugElement.query(By.css('sci-menu-item-icon')).query(By.css(selector));
  }

  public get label(): string {
    return (this.debugElement.query(By.css('sci-menu-item-label')).nativeElement as HTMLElement).innerText;
  }

  public labelComponent(selector: string): DebugElement | undefined {
    return this.debugElement.query(By.css('sci-menu-item-label')).query(By.css(selector));
  }

  public get checked(): boolean {
    return this.nativeElement.classList.contains('checked');
  }

  public get active(): boolean {
    return this.nativeElement.classList.contains('active');
  }

  public get actions(): ToolbarGroupPO {
    return new ToolbarGroupPO(this._fixture, `${this._selector} sci-toolbar-group.e2e-actions`);
  }
}

export class MenuGroupPO {

  constructor(private _fixture: ComponentFixture<unknown>, private _selector: string) {
  }

  public get debugElement(): DebugElement {
    return this._fixture.debugElement.parent!.query(By.css(this._selector));
  }

  public get nativeElement(): HTMLElement {
    return this.debugElement.nativeElement as HTMLElement;
  }

  public get header(): DebugElement | undefined {
    const groupHeader = this.debugElement.query(By.css('header.e2e-group-header')) as DebugElement | undefined;
    return groupHeader ?? this.debugElement.query(By.css('button.e2e-group-header'));
  }

  public items(): Array<MenuItemPO | MenuGroupPO> {
    let itemIndex = 0;
    let groupIndex = 0;

    return this.debugElement.children.reduce((acc, child) => {
      const nativeElement = child.nativeElement as HTMLElement;

      if (nativeElement.classList.contains('e2e-menu-item')) {
        acc.push(new MenuItemPO(this._fixture, `${this._selector} > :nth-child(${++itemIndex} of button.e2e-menu-item)`, {parentSelector: this._selector}));
      }
      else if (nativeElement.tagName === 'SCI-MENU-GROUP') {
        acc.push(new MenuGroupPO(this._fixture, `${this._selector} > :nth-child(${++groupIndex} of sci-menu-group)`));
      }
      return acc;
    }, new Array<MenuItemPO | MenuGroupPO>());
  }

  public get label(): string {
    const label = this.header?.query(By.css('sci-menu-group-label'));
    const header = label?.nativeElement as HTMLElement | undefined;
    return header?.innerText ?? '';
  }

  public get collapsed(): boolean {
    const icon = this.header?.query(By.css('sci-icon')).nativeElement as HTMLElement | undefined;
    return icon?.innerText === 'chevron_right';
  }

  public get actions(): ToolbarGroupPO {
    return new ToolbarGroupPO(this._fixture, `${this._selector} sci-toolbar-group.e2e-actions`);
  }
}
