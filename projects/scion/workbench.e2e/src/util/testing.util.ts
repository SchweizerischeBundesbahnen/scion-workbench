/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $, browser, ElementFinder, Key, logging } from 'protractor';
import Level = logging.Level;
import Entry = logging.Entry;

/**
 * Selects an option of a select dropdown.
 */
export async function selectOption(value: string, selectField: ElementFinder): Promise<void> {
  await selectField.$(`option[value="${value}"`).click();
}

/**
 * Expects the popup for given identity to show.
 */
export async function expectPopupToShow(expected: { popupCssClass: string; componentSelector: string; }): Promise<any> {
  const ctx = `popupCssClass=${expected.popupCssClass}, component=${expected.componentSelector}`;

  await expect(await $(`.wb-popup.${expected.popupCssClass}`).isDisplayed()).toBe(true, `Expected 'wb-popup' to show [${ctx}]`);
  await expect(await $(expected.componentSelector).isDisplayed()).toBe(true, `Expected component <${expected.componentSelector}> to show [${ctx}]`);
}

/**
 * Expects the popup for given identity to not be present in the DOM.
 */
export async function expectPopupToNotExist(expected: { popupCssClass: string; }): Promise<void> {
  const ctx = `popupCssClass=${expected.popupCssClass}`;

  await expect(await $(`.wb-popup.${expected.popupCssClass}`).isPresent()).toBe(false, `Expected 'wb-popup' not to be present in the DOM [${ctx}]`);
}

/**
 * Returns if given CSS class is present on given element.
 */
export async function isCssClassPresent(elementFinder: ElementFinder, cssClass: string): Promise<boolean> {
  const classes: string[] = await getCssClasses(elementFinder);
  return classes.includes(cssClass);
}

/**
 * Returns css classes on given element.
 */
export async function getCssClasses(elementFinder: ElementFinder): Promise<string[]> {
  const classAttr: string = await elementFinder.getAttribute('class');
  return classAttr.split(/\s+/);
}

/**
 * Sends the given keys to the currently focused element.
 */
export async function sendKeys(...keys: string[]): Promise<void> {
  return browser.actions().sendKeys(...keys).perform();
}

/**
 * Enters the given text into the given input field.
 *
 * By default, the text is set directly as input to the field, because 'sendKeys' is very slow.
 */
export async function enterText(text: string, elementFinder: ElementFinder, inputStrategy: 'sendKeys' | 'setValue' = 'setValue'): Promise<void> {
  switch (inputStrategy) {
    case 'sendKeys': { // send keys is slow for long texts
      await elementFinder.clear();
      await elementFinder.click();
      await sendKeys(text);
      break;
    }
    case 'setValue': {
      // fire the 'input' event manually because not fired when setting the value with javascript
      await elementFinder.click();
      await browser.executeScript('arguments[0].value=arguments[1]; arguments[0].dispatchEvent(new Event(\'input\'));', elementFinder.getWebElement(), text);
      await sendKeys(Key.TAB);
      break;
    }
    default: {
      throw Error('[UnsupportedStrategyError] Input strategy not supported.');
    }
  }
}

/**
 * Reads the element value of the given element.
 */
export function getInputValue(elementFinder: ElementFinder): Promise<any> {
  return browser.executeScript('return arguments[0].value', elementFinder.getWebElement()) as Promise<any>;
}

/**
 * Clicks the given element while pressing the specified modifier key.
 * The modifier key must be one of {ALT, CONTROL, SHIFT, COMMAND, META}.
 */
export async function pressModifierThenClick(elementFinder: ElementFinder, modifierKey: string): Promise<void> {
  await browser.actions().mouseMove(elementFinder).perform();

  // It is important to release the pressed key by {@link #keyUp} in order to avoid side effects in other tests.
  await browser.actions().keyDown(modifierKey).click().keyUp(modifierKey).perform();
}

/**
 * Reads the errors from the browser console.
 * Note that log buffers are reset after this call.
 */
export async function browserErrors(): Promise<Entry[]> {
  const logs = await browser.manage().logs().get('browser');
  return logs.filter(log => log.level === Level.SEVERE);
}

/**
 * Instructs Protractor to disable Angular synchronization while running the given function.
 */
export async function runOutsideAngularSynchronization<T = void>(fn: () => Promise<T>): Promise<T> {
  const waitForAngularEnabled = await browser.waitForAngularEnabled();
  await browser.waitForAngularEnabled(false);
  try {
    return await fn();
  }
  finally {
    await browser.waitForAngularEnabled(waitForAngularEnabled);
  }
}

/**
 * Confirms an alert dialog. Throws if there is no alert dialog showing.
 */
export async function confirmAlert(options?: { confirmDelay?: number }): Promise<void> {
  const alert = await browser.switchTo().alert();
  try {
    if (options?.confirmDelay !== undefined) {
      await browser.sleep(options.confirmDelay);
    }
    await alert.accept();
  }
  finally {
    await browser.switchTo().defaultContent();
  }
}
