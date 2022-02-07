/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {$, browser, protractor, WebElement} from 'protractor';
import {runOutsideAngularSynchronization, setAttribute} from './testing.util';

const EC = protractor.ExpectedConditions;

export namespace WebdriverExecutionContexts {

  /**
   * Unique iframe identity to determine if to switch the WebDriver execution context when interacting with the iframe.
   * The identity is computed and set when interacting with the iframe for the first time.
   */
  const CONTEXT_ATTR_NAME = 'data-webdriver-execution-context';

  /**
   * Switches the WebDriver execution context to the root execution context.
   *
   * Workbench DOM elements are part of the root execution context.
   */
  export async function switchToDefault(): Promise<void> {
    // Do not wait for Angular as the page must not necessarily be an Angular page.
    await runOutsideAngularSynchronization(async () => {
      // Test if a context switch is required.
      if (await isExecutionContextActive('root')) {
        return;
      }
      await browser.switchTo().defaultContent();
      await setDocumentContextMarkerIfAbsent('root');

      console.log('Switched WebDriver execution context to the root page.');
    });
  }

  /**
   * Switches the WebDriver execution context to this `<sci-router-outlet>`. When resolved,
   * future Protractor commands are sent to this outlet.
   *
   * Elements contained within iframes can not be accessed from inside the root execution context.
   * Instead, the execution context must first be switched to the iframe.
   */
  export async function switchToIframe(outletName: string): Promise<void> {
    // Do not wait for Angular as the page must not necessarily be an Angular page.
    await runOutsideAngularSynchronization(async () => {
      // Check if the WebDriver execution context for this document is already active.
      if (await isExecutionContextActive(outletName)) {
        return;
      }

      // In order to activate this iframe's WebDriver execution context, its parent iframe execution contexts must be activated first.
      await switchToDefault();

      // Get the iframe from the <sci-router-outlet> custom element (inside shadow DOM)
      const routerOutletFinder = $(`sci-router-outlet[name="${outletName}"]`);
      await browser.wait(EC.presenceOf(routerOutletFinder), 5000);
      const iframe = await browser.executeScript<WebElement>('return arguments[0].iframe', routerOutletFinder.getWebElement());

      // Activate the iframe's WebDriver execution context.
      await browser.switchTo().frame(iframe);
      await setDocumentContextMarkerIfAbsent(outletName);

      // Since Angular 9, Protractor may not recognize a launching Angular application if it is embedded in an iframe and uses app initializers.
      // This can lead to the following error: 'Both AngularJS testability and Angular testability are undefined'.
      // For this reason, we wait until Angular completes initialization.
      await browser.wait(protractor.ExpectedConditions.presenceOf($('*[ng-version]')));

      console.log(`Switched WebDriver execution context to the iframe of the outlet ${outletName}.`);
    });
  }

  /**
   * Marks the current Document to be part of the given execution context name.
   * The marker will be used by later interactions to decide if a context switch is required.
   */
  async function setDocumentContextMarkerIfAbsent(contextName: string): Promise<void> {
    if (!await isExecutionContextActive(contextName)) {
      await setAttribute($('body'), CONTEXT_ATTR_NAME, contextName);
    }
  }

  /**
   * Tests whether the given WebDriver execution context is active.
   */
  async function isExecutionContextActive(contextName: string): Promise<boolean> {
    const bodyFinder = $('body');

    try {
      const currentContext = await bodyFinder.getAttribute(CONTEXT_ATTR_NAME);
      return (currentContext === contextName);
    }
    catch {
      // Protractor throws an error if the current WebDriver execution context is stale. For example,
      // an active iframe context becomes stale when removing the iframe from the DOM, e.g., when closing
      // a workbench view from inside the iframe.
      return false;
    }
  }
}

