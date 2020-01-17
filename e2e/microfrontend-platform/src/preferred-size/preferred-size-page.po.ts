/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { $ } from 'protractor';
import { enterText } from '../spec.util';
import { SwitchToIframeFn } from '../browser-outlet/browser-outlet.po';
import { SciCheckboxPO } from '@scion/ɵtoolkit/widgets.po';
import { ISize } from 'selenium-webdriver';

export class PreferredSizePagePO {

  public static readonly pageUrl = 'preferred-size'; // path to the page; required by {@link TestingAppPO}

  private _pageFinder = $('app-preferred-size');

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async enterCssWidth(width: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(width, this._pageFinder.$('input.e2e-css-width'));
  }

  public async enterCssHeight(height: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(height, this._pageFinder.$('input.e2e-css-height'));
  }

  public async enterPreferredWidth(width: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(width, this._pageFinder.$('input.e2e-preferred-width'));
  }

  public async enterPreferredHeight(height: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(height, this._pageFinder.$('input.e2e-preferred-height'));
  }

  public async checkUseElementSize(check: boolean): Promise<void> {
    await this._switchToIframeFn();
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-use-element-size')).toggle(check);
  }

  public async clickReset(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-reset').click();
  }

  public async clickBindElementObservable(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-bind-element-observable').click();
  }

  public async clickUnbindElementObservable(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-unbind-element-observable').click();
  }

  public async clickUnmount(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-unmount').click();
  }

  /**
   * Returns the size of this component.
   */
  public async getSize(): Promise<ISize> {
    await this._switchToIframeFn();
    return this._pageFinder.getSize();
  }
}
