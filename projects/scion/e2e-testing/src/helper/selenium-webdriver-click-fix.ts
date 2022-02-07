/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {browser, ElementFinder, WebElement} from 'protractor';
import {SciListItemPO} from '@scion/toolkit.internal/widgets.po';

/**
 * Repairs clicking DOM elements contained in an iframe part of a shadow DOM.
 *
 * Due to an issue with the Selenium WebDriver, elements within an iframe cannot be clicked if the iframe is part of a shadow DOM.
 *
 * Error: 'Failed: unknown error: no element reference returned by script'.
 *
 * This fix patches {@link WebElement#click} and {@link ElementFinder#click} methods and clicks the element programmatically
 * through a script.
 *
 * ---
 * Protractor: 5.4.2
 * Chrome: 79.0.3945.0
 * Chrome WebDriver: 79.0.3945.0 // webdriver-manager update --versions.chrome=79.0.3945.0
 * Puppeteer: 2.0.0 // Chrome 79
 *
 * ---
 * See related issues:
 * https://stackoverflow.com/q/51629411
 * https://stackoverflow.com/q/58872973
 */
export class SeleniumWebDriverClickFix {

  private origElementFinderClickFn = ElementFinder.prototype.click;
  private origWebElementClickFn = WebElement.prototype.click;
  private origSciListItemPOClickFn = SciListItemPO.prototype.clickAction;

  public install(): void {
    ElementFinder.prototype.click = async function(): Promise<void> {
      await click(this.getWebElement());
    };
    WebElement.prototype.click = async function(): Promise<void> {
      await click(this);
    };
    SciListItemPO.prototype.clickAction = async function(cssClass: string): Promise<void> {
      const actionButtonFinder = this.actionsFinder.$$(`button.${cssClass}`).first();
      // hovering the action is not necessary as being clicked through script
      await click(actionButtonFinder.getWebElement());
    };
  }

  public uninstall(): void {
    ElementFinder.prototype.click = this.origElementFinderClickFn;
    WebElement.prototype.click = this.origWebElementClickFn;
    SciListItemPO.prototype.clickAction = this.origSciListItemPOClickFn;
  }
}

/**
 * Repairs clicking DOM elements contained in an iframe part of a shadow DOM.
 */
export function installSeleniumWebDriverClickFix(): void {
  const fix = new SeleniumWebDriverClickFix();
  beforeAll(() => fix.install());
  afterAll(() => fix.uninstall());
}

/**
 * Due to an issue with the Selenium WebDriver, elements within an iframe cannot be clicked if the iframe is part of a shadow DOM.
 *
 * Error: 'Failed: unknown error: no element reference returned through a script'.
 *
 * This method clicks the element returned by the {@link ElementFinder} programmatically via script.
 *
 * ---
 * Protractor: 5.4.2
 * Chrome: 79.0.3945.0
 * Chrome WebDriver: 79.0.3945.0 // webdriver-manager update --versions.chrome=79.0.3945.0
 * Puppeteer: 2.0.0 // Chrome 79
 *
 * ---
 * See related issues:
 * https://stackoverflow.com/q/51629411
 * https://stackoverflow.com/q/58872973
 */
async function click(element: WebElement): Promise<void> {
  const script = `
    if (arguments[0].tagName === 'INPUT' && arguments[0].type === 'text') {
      arguments[0].focus();
    }
    else if (arguments[0].tagName === 'TEXTAREA') {
      arguments[0].focus();
    }
    else if (arguments[0].tagName === 'OPTION') {
      arguments[0].focus && arguments[0].focus();
      arguments[0].selected = true;
      // fire the 'change' event manually because not fired when selecting the option with javascript
      arguments[0].parentElement.dispatchEvent(new Event('change'));
    }
    else {
      arguments[0].focus && arguments[0].focus();
      arguments[0].click();
    }`;
  await browser.executeScript(script, element);
}
