/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {waitUntilStable} from '../helper/testing.util';

test.describe('Angular Change Detection', () => {

  /**
   * Do not remove this test to ensure change detection cycles to be logged to the console, a prerequisite for other tests.
   */
  test('should log Angular change detection cycles', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Enable logging of Angular change detection cycles.
    await appPO.header.clickMenuItem({cssClass: 'e2e-log-angular-change-detection-cycles'}, {check: true});

    // Open new tab to trigger change detection cycles.
    await appPO.openNewViewTab();

    // Ensure Angular change detection cycles to be logged to the console.
    await expect.poll(() => consoleLogs.get({message: '[AppComponent] Angular change detection cycle'})).not.toHaveLength(0);
  });

  test('should not trigger Angular change detection when typing', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test page.
    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);

    // Enable logging of Angular change detection cycles.
    await appPO.header.clickMenuItem({cssClass: 'e2e-log-angular-change-detection-cycles'}, {check: true});
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Expect Angular not to run change detection when typing.
    await testPage.enterText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.', {pressSequentially: true});
    await waitUntilStable(() => consoleLogs.get().length);
    await expect.poll(() => consoleLogs.get({message: '[AppComponent] Angular change detection cycle'})).toHaveLength(0);
  });

  test('should not trigger Angular change detection when clicking', async ({appPO, workbenchNavigator, consoleLogs, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test page.
    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);

    // Enable logging of Angular change detection cycles.
    await appPO.header.clickMenuItem({cssClass: 'e2e-log-angular-change-detection-cycles'}, {check: true});
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Expect Angular not to run change detection when clicking.
    await testPage.checkbox.click();
    await testPage.checkbox.click();
    await testPage.input.click();
    await testPage.input.hover();
    await page.mouse.down();
    await page.mouse.up();
    await waitUntilStable(() => consoleLogs.get().length);
    await expect.poll(() => consoleLogs.get({message: '[AppComponent] Angular change detection cycle'})).toHaveLength(0);
  });

  test('should not trigger Angular change detection when moving the mouse', async ({appPO, consoleLogs, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Enable logging of Angular change detection cycles.
    await appPO.header.clickMenuItem({cssClass: 'e2e-log-angular-change-detection-cycles'}, {check: true});
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Expect Angular not to run change detection when moving the mouse.
    await page.mouse.move(0, 0);
    await page.mouse.move(500, 500, {steps: 100});
    await waitUntilStable(() => consoleLogs.get().length);
    await expect.poll(() => consoleLogs.get({message: '[AppComponent] Angular change detection cycle'})).toHaveLength(0);
  });
});
