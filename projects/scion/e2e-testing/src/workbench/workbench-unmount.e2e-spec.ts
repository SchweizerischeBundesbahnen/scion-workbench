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
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {ViewPagePO as MicrofrontendViewPagePO} from '../workbench-client/page-object/view-page.po';

test.describe('Workbench Component', () => {

  /**
   * Regression test for a bug where the workbench component was not destroyed if one or more views were opened.
   */
  test('should destroy the workbench component when unmounting it', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view because the bug was caused by view(s) being detached when unmounting the workbench (WorkbenchPortalOutletDirective)
    await appPO.openNewViewTab();

    // Expect the workbench component to be constructed.
    await expect(await appPO.isWorkbenchComponentPresent()).toBe(true);
    await expect(await consoleLogs.get({severity: 'debug', filter: /WorkbenchComponent#construct/, consume: true})).toHaveLength(1);
    await expect(await appPO.viewCount()).toBeGreaterThan(0);

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Expect the workbench component to be destroyed.
    await expect(await appPO.isWorkbenchComponentPresent()).toBe(false);
    await expect(await consoleLogs.get({severity: 'debug', filter: /WorkbenchComponent#destroy/, consume: true})).toHaveLength(1);
  });

  test('should not restart the workbench when re-mounting the workbench component', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Expect the workbench to be started.
    await expect(await consoleLogs.get({severity: 'debug', filter: /WorkbenchLifecycleHookLogger#init.*WORKBENCH_STARTUP/, consume: true})).toHaveLength(1);

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect the workbench not to be started again.
    await expect(await consoleLogs.get({severity: 'debug', filter: /WorkbenchLifecycleHookLogger#init.*WORKBENCH_STARTUP/, consume: true})).toHaveLength(0);
  });

  test('should re-mount the workbench component without errors', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect no errors to be logged.
    await expect(await consoleLogs.get({severity: 'error', consume: true})).toHaveLength(0);
  });

  test('should restore message box when re-mounting the workbench component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open message box.
    const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.clickOpen();

    // Expect the message box to display.
    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(await messageBox.isVisible()).toBe(true);

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Expect the DOM not to contain workbench elements.
    await expect(await appPO.isWorkbenchComponentPresent()).toBe(false);
    await expect(await messageBox.isPresent()).toBe(false);
    await expect(await messageBoxOpenerPage.isPresent()).toBe(false);

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect the message box to display.
    await expect(await appPO.isWorkbenchComponentPresent()).toBe(true);
    await expect(await messageBox.isVisible()).toBe(true);
    await expect(await messageBoxOpenerPage.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toBe(1);
  });

  test('should preserve view state when re-mounting the workbench component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view page and enter free text as the view state.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPage.enterFreeText('view state');

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect the view to display.
    await expect(await viewPage.isVisible()).toBe(true);

    // Expect the view to display and the free text to be preserved.
    await expect(await viewPage.getFreeText()).toEqual('view state');
  });

  test('should attach message box to the "actual" ViewContainerRef when re-creating the workbench component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open message box opener page
    const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Open message box.
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.clickOpen();

    // Expect the message box to display.
    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(await messageBox.isVisible()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toBe(1);
  });

  test('should restore microfrontend when re-mounting the workbench component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open view with a microfrontend.
    const viewPage = await microfrontendNavigator.openInNewTab(MicrofrontendViewPagePO, 'app1');

    // Expect the view and the microfrontend to display.
    await expect(await viewPage.isVisible()).toBe(true);

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Expect the DOM not to contain workbench elements.
    await expect(await appPO.isWorkbenchComponentPresent()).toBe(false);
    await expect(await viewPage.isPresent()).toBe(false);

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect the view and the microfrontend to display.
    await expect(await appPO.isWorkbenchComponentPresent()).toBe(true);
    await viewPage.waitUntilAttached();
    await expect(await viewPage.isVisible()).toBe(true);
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
    await expect(await viewPage.isVisible()).toBe(true);
  });

  /**
   * Regression test for a bug where modelled actions were not destroyed if one or more views were opened.
   *
   * This test requires the action to be associated with a workbench element (and not registered via LayoutPage).
   */
  test('should destroy part actions when unmounting the workbench component', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view because the bug was caused by view(s) being detached when unmounting the workbench (WorkbenchPortalOutletDirective)
    await appPO.openNewViewTab();

    // Expect view(s) to be opened.
    await expect(await appPO.viewCount()).toBeGreaterThan(0);

    // Expect part action modelled as content of the workbench component to display.
    await expect(await appPO.activePart({inMainArea: true}).action({cssClass: 'e2e-open-new-tab'}).isVisible()).toBe(true);

    // Unmount the workbench component by navigating the primary router outlet.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});

    // Re-mount the workbench component by navigating the primary router.
    await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});

    // Expect part action to display.
    await expect(await appPO.activePart({inMainArea: true}).action({cssClass: 'e2e-open-new-tab'}).isVisible()).toBe(true);

    // Expect previous part action to be destroyed.
    await expect(await appPO.activePart({inMainArea: true}).action({cssClass: 'e2e-open-new-tab'}).count()).toBe(1);
  });
});
