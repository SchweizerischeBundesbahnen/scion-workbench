/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {ViewPagePO as MicrofrontendViewPagePO} from '../workbench-client/page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';

test.describe('Workbench Component', () => {

  /**
   * Regression test for a bug where the workbench component was not destroyed if one or more views were opened.
   */
  test('should destroy the workbench component when unmounting it', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view because the bug was caused by view(s) being detached when unmounting the workbench (WorkbenchPortalOutletDirective)
    await appPO.openNewViewTab();

    // Expect the workbench component to be constructed.
    await expect(appPO.workbenchLocator).toBeVisible();
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /WorkbenchComponent#construct/})).toHaveLength(1);
    await expect.poll(() => appPO.views().count()).toBeGreaterThan(0);
    consoleLogs.clear();

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Expect the workbench component to be destroyed.
    await expect(appPO.workbenchLocator).not.toBeAttached();
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /WorkbenchComponent#destroy/})).toHaveLength(1);
  });

  test('should not restart the workbench when re-mounting the workbench component', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Expect the workbench to be started.
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /WorkbenchLifecycleHookLogger#init.*WORKBENCH_STARTUP/})).toHaveLength(1);
    consoleLogs.clear();

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect the workbench not to be started again.
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /WorkbenchLifecycleHookLogger#init.*WORKBENCH_STARTUP/})).toHaveLength(0);
  });

  test('should re-mount the workbench component without errors', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect no errors to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should preserve view state when re-mounting the workbench component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view page and enter free text as the view state.
    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);
    await testPage.enterText('view state');

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect the view to display.
    await expectView(testPage).toBeActive();

    // Expect the view to display and the free text to be preserved.
    await expect(testPage.input).toHaveValue('view state');
  });

  test('should restore microfrontend when re-mounting the workbench component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open view with a microfrontend.
    const viewPage = await microfrontendNavigator.openInNewTab(MicrofrontendViewPagePO, 'app1');

    // Expect the view and the microfrontend to display.
    await expectView(viewPage).toBeActive();

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Expect the DOM not to contain workbench elements.
    await expect(appPO.workbenchLocator).not.toBeAttached();
    await expectView(viewPage).not.toBeAttached();

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect the view and the microfrontend to display.
    await expect(appPO.workbenchLocator).toBeVisible();
    await expectView(viewPage).toBeActive();
  });

  test('should attach microfrontend to the "actual" ViewContainerRef when re-creating the workbench component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Open view with a microfrontend.
    const viewPage = await microfrontendNavigator.openInNewTab(MicrofrontendViewPagePO, 'app1');

    // Expect the view and the microfrontend to display.
    await expectView(viewPage).toBeActive();
  });

  /**
   * Regression test for a bug where modeled actions were not destroyed if one or more views were opened.
   *
   * This test requires the action to be associated with a workbench element (and not registered via LayoutPage).
   */
  test('should destroy part actions when unmounting the workbench component', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view because the bug was caused by view(s) being detached when unmounting the workbench (WorkbenchPortalOutletDirective)
    await appPO.openNewViewTab();

    // Expect view(s) to be opened.
    await expect.poll(() => appPO.views().count()).toBeGreaterThan(0);

    // Expect part action modeled as content of the workbench component to display.
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'e2e-open-new-tab'}).locator).toBeVisible();

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect part action to display.
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'e2e-open-new-tab'}).locator).toBeVisible();

    // Expect previous part action to be destroyed.
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'e2e-open-new-tab'}).locator).toHaveCount(1);
  });
});
