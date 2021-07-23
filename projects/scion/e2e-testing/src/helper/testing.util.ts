/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {browser, ElementFinder, Key, logging, protractor} from 'protractor';
import Level = logging.Level;

const EC = protractor.ExpectedConditions;

/**
 * Selects an option of a select dropdown.
 */
export async function selectOption(value: string, selectField: ElementFinder): Promise<void> {
  await selectField.$(`option[value="${value}"`).click();
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
  const enterTextFn = async () => {
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
  };

  try {
    await enterTextFn();
  }
  catch (error) {
    // Maybe, the element is not interactable because not scrolled into view. Try again, but scroll it into view first.
    // This error often occurs on GitHub CI, but not when running tests locally.
    if (error instanceof Error && error.name === 'ElementNotVisibleError') {
      console.log(`[ElementNotVisibleError] Element not interactable: ${elementFinder.locator().toString()}. Scrolling it into view and trying to enter text again.`, error);
      await browser.executeScript('arguments[0].scrollIntoView()', elementFinder.getWebElement());
      await enterTextFn();
      console.log(`Text successfully entered into input field: ${elementFinder.locator().toString()}`);
    }
    else {
      throw error;
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
 * Reads the log from the browser console.
 * Note that log buffers are reset after this call.
 *
 * By default browser allows recording only WARNING and SEVERE level messages. In order to be able asserting any level,
 * you need to change the loggingPrefs.browser capabilities in `protractor.conf.js`.
 */
export async function consumeBrowserLog(severity: Level = Level.SEVERE, filter?: RegExp): Promise<string[]> {
  return (await browser.manage().logs().get('browser'))
    .filter(log => log.level === severity)
    .map(log => log.message)
    .map(message => message.match(/"(.+)"/)[1]) // log message is contained in double quotes
    .filter(log => filter ? log.match(filter) : true);
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
export async function confirmAlert(options?: {confirmDelay?: number}): Promise<void> {
  await browser.wait(EC.alertIsPresent());
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

/**
 * Confirms an alert dialog. Throws if there is no alert dialog showing.
 */
export async function dismissAlert(options?: {confirmDelay?: number}): Promise<void> {
  await browser.wait(EC.alertIsPresent());
  const alert = await browser.switchTo().alert();
  try {
    if (options?.confirmDelay !== undefined) {
      await browser.sleep(options.confirmDelay);
    }
    await alert.dismiss();
  }
  finally {
    await browser.switchTo().defaultContent();
  }
}

/**
 * Sets an attribute of the given name and value on the specified element.
 */
export async function setAttribute(elementFinder: ElementFinder, name: string, value: string): Promise<void> {
  await browser.executeScript('arguments[0].setAttribute(arguments[1], arguments[2]);', elementFinder.getWebElement(), name, value);
}

/**
 * Asserts the given page to be displayed in the current Webdriver execution context.
 */
export async function assertPageToDisplay(pageFinder: ElementFinder): Promise<void> {
  if (!await pageFinder.isPresent()) {
    throw Error(`[TestingError] Expected page '${pageFinder.locator()}' to be present, but was not. Did you forget to switch the WebDriver execution context?`);
  }
  if (!await pageFinder.isDisplayed()) {
    throw Error(`[TestingError] Expected page '${pageFinder.locator()}' to be displayed, but was not. Did you forget to activate the view tab?`);
  }
}

/**
 * Returns if given element is the active element.
 */
export async function isActiveElement(testee: ElementFinder): Promise<boolean> {
  const activeElementOpaqueId = await browser.driver.switchTo().activeElement().getId();
  const testeeOpaqueId = await testee.getId();
  return activeElementOpaqueId === testeeOpaqueId;
}
