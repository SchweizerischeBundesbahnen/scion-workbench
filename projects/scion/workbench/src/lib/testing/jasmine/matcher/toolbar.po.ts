import {ComponentFixture} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {OneOf} from '@scion/toolkit/types';

export class ToolbarPO {

  private readonly _group: ToolbarGroupPO;
  private readonly _selector: string;

  constructor(private _fixture: ComponentFixture<unknown>, private _locateBy?: OneOf<{cssClass?: string; selector?: string}>) {
    this._selector = (() => {
      if (this._locateBy?.selector) {
        return this._locateBy.selector;
      }
      if (this._locateBy?.cssClass) {
        return `sci-toolbar.${this._locateBy.cssClass}`;
      }
      return 'sci-toolbar';
    })();
    this._group = new ToolbarGroupPO(this._fixture, `${this._selector} sci-toolbar-group`);
  }

  public get debugElement(): DebugElement {
    return this._fixture.debugElement.parent!.query(By.css(this._selector));
  }

  public get nativeElement(): HTMLElement {
    return this.debugElement.nativeElement as HTMLElement;
  }

  public items(): Array<ToolbarButtonPO | ToolbarSplitButtonPO | ToolbarControlPO | ToolbarGroupPO> {
    return this._group.items();
  }

  public button(locateBy: {cssClass: string}): ToolbarButtonPO {
    return this._group.button(locateBy);
  }

  public splitButton(locateBy: {cssClass: string}): ToolbarSplitButtonPO {
    return this._group.splitButton(locateBy);
  }

  public control(locateBy: {cssClass: string}): ToolbarControlPO {
    return this._group.control(locateBy);
  }
}

export class ToolbarGroupPO {

  constructor(private _fixture: ComponentFixture<unknown>, private _selector: string) {
  }

  public get debugElement(): DebugElement | null {
    return this._fixture.debugElement.parent!.query(By.css(this._selector));
  }

  public get nativeElement(): HTMLElement | null {
    return this.debugElement?.nativeElement as HTMLElement | null;
  }

  public items(): Array<ToolbarButtonPO | ToolbarSplitButtonPO | ToolbarControlPO | ToolbarGroupPO> {
    let buttonIndex = 0;
    let controlIndex = 0;
    let splitButtonIndex = 0;
    let groupIndex = 0;

    return (this.debugElement?.children ?? []).reduce((acc, child) => {
      const nativeElement = child.nativeElement as HTMLElement;

      if (child.name === 'button' && nativeElement.classList.contains('e2e-menu-item')) {
        acc.push(new ToolbarButtonPO(this._fixture, `${this._selector} > :nth-child(${++buttonIndex} of button.e2e-menu-item)`));
      }
      else if (child.name === 'sci-toolbar-control') {
        acc.push(new ToolbarControlPO(this._fixture, `${this._selector} > :nth-child(${++controlIndex} of sci-toolbar-control)`));
      }
      else if (child.name === 'sci-toolbar-split-button') {
        acc.push(new ToolbarSplitButtonPO(this._fixture, `${this._selector} > :nth-child(${++splitButtonIndex} of sci-toolbar-split-button)`));
      }
      else if (child.name === 'sci-toolbar-group') {
        acc.push(new ToolbarGroupPO(this._fixture, `${this._selector} > :nth-child(${++groupIndex} of sci-toolbar-group)`));
      }
      return acc;
    }, new Array<ToolbarButtonPO | ToolbarSplitButtonPO | ToolbarControlPO | ToolbarGroupPO>());
  }

  public button(locateBy: {cssClass: string}): ToolbarButtonPO {
    return new ToolbarButtonPO(this._fixture, `${this._selector} button.e2e-menu-item.${locateBy.cssClass}`);
  }

  public splitButton(locateBy: {cssClass: string}): ToolbarSplitButtonPO {
    return new ToolbarSplitButtonPO(this._fixture, `${this._selector} sci-toolbar-split-button.${locateBy.cssClass}`);
  }

  public control(locateBy: {cssClass: string}): ToolbarControlPO {
    return new ToolbarControlPO(this._fixture, `${this._selector} sci-toolbar-control.${locateBy.cssClass}`);
  }
}

export class ToolbarButtonPO {

  constructor(private _fixture: ComponentFixture<unknown>, private _selector: string) {
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
    return this.debugElement.query(By.css('sci-toolbar-icon')).query(By.css(selector));
  }

  public get label(): string {
    return (this.debugElement.query(By.css('sci-toolbar-label')).nativeElement as HTMLElement).innerText;
  }

  public labelComponent(selector: string): DebugElement | undefined {
    return this.debugElement.query(By.css('sci-toolbar-label')).query(By.css(selector));
  }

  public get visualMenuIndicator(): boolean {
    return this.nativeElement.classList.contains('menu-indicator');
  }

  public get checked(): boolean {
    return this.nativeElement.classList.contains('checked');
  }
}

export class ToolbarSplitButtonPO {

  public readonly primaryButton: ToolbarButtonPO;
  public readonly menuButton: ToolbarButtonPO;

  constructor(private _fixture: ComponentFixture<unknown>, private _selector: string) {
    this.primaryButton = new ToolbarButtonPO(this._fixture, `${this._selector} > :nth-child(1 of button.e2e-menu-item)`);
    this.menuButton = new ToolbarButtonPO(this._fixture, `${this._selector} > :nth-child(2 of button.e2e-menu-item)`);
  }
}

export class ToolbarControlPO {

  constructor(private _fixture: ComponentFixture<unknown>, private _selector: string) {
  }

  public get debugElement(): DebugElement {
    return this._fixture.debugElement.parent!.query(By.css(this._selector));
  }

  public get nativeElement(): HTMLElement {
    return this.debugElement.nativeElement as HTMLElement;
  }

  public component(selector: string): DebugElement | undefined {
    return this.debugElement.query(By.css(selector));
  }
}
