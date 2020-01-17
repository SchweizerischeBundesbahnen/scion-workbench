/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { $, browser, WebElement } from 'protractor';
import { enterText } from '../spec.util';
import { SwitchToIframeFn } from '../browser-outlet/browser-outlet.po';
import { RouterOutletContextPO } from '../context/router-outlet-context.po';
import { ISize } from 'selenium-webdriver';
import { RouterOutletSettingsPO } from '../settings/router-outlet-settings.po';
import { TestingAppPO } from '../testing-app.po';
import { ConsolePanelPO } from '../console/console-panel.po';

export class RouterOutletPagePO {

  public static readonly pageUrl = 'router-outlet'; // path to the page; required by {@link TestingAppPO}

  private _pageFinder = $('app-router-outlet');

  /**
   * Allows defining the context of this outlet.
   */
  public readonly outletContextPO: RouterOutletContextPO;

  /**
   * Allows reading logs from the console of the testing app.
   */
  public readonly consolePanelPO: ConsolePanelPO;

  /**
   * Allows configuring the settings of this outlet.
   */
  public readonly outletSettingsPO: RouterOutletSettingsPO;

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
    this.outletContextPO = new RouterOutletContextPO(this._pageFinder, this._switchToIframeFn);
    this.consolePanelPO = new TestingAppPO().consolePanelPO(this._switchToIframeFn);
    this.outletSettingsPO = new RouterOutletSettingsPO(this._pageFinder, this._switchToIframeFn);
  }

  public async enterOutletName(outlet: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(outlet, this._pageFinder.$('input.e2e-outlet-name'));
  }

  public async clickApply(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-apply').click();
  }

  /**
   * Returns the URL of the embedded web content.
   */
  public async getRouterOutletUrl(): Promise<string> {
    await this.switchToRouterOutletIframe();

    // Do not wait for Angular as the site must not necessarily be an Angular powered site, e.g. 'about:blank'.
    const waitForAngularEnabledState = browser.waitForAngularEnabled();
    await browser.waitForAngularEnabled(false);
    try {
      return browser.executeScript('return document.location.href');
    }
    finally {
      await browser.waitForAngularEnabled(waitForAngularEnabledState);
    }
  }

  /**
   * Returns the size of the router outlet.
   */
  public async getRouterOutletSize(): Promise<ISize> {
    await this._switchToIframeFn();
    return this._pageFinder.$('sci-router-outlet').getSize();
  }

  /**
   * Switches the WebDriver execution context to the iframe of the `<sci-router-outlet>`. When resolved,
   * future Protractor commands are sent to that iframe.
   */
  public async switchToRouterOutletIframe(): Promise<void> {
    await this._switchToIframeFn();
    // Get the iframe from the custom element (inside shadow DOM)
    const iframe = await browser.executeScript('return arguments[0].iframe', this._pageFinder.$('sci-router-outlet').getWebElement()) as WebElement;
    // Activate this iframe's WebDriver execution context.
    await browser.switchTo().frame(iframe);
  }
}
