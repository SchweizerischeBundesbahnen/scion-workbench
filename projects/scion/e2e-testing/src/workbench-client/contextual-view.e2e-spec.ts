/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {ViewPagePO} from './page-object/view-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {PopupPagePO} from './page-object/popup-page.po';

test.describe('Contextual Workbench View', () => {

  test('should detach popup if contextual view is not active', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });

    // Open popop.
    const popupOpenerView = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerView.enterCssClass('testee');
    await popupOpenerView.enterQualifier({component: 'testee'});
    await popupOpenerView.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerView.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(popupPage.popup.locator).toBeVisible();
    await expect(popupPage.outlet.locator).toBeVisible();

    // Open another view.
    await appPO.openNewViewTab();
    await expect(popupPage.popup.locator).not.toBeVisible();
    await expect(popupPage.outlet.locator).not.toBeVisible();

    // Activate popup opener view.
    await popupOpenerView.viewTab.click();
    await expect(popupPage.popup.locator).toBeVisible();
    await expect(popupPage.outlet.locator).toBeVisible();
  });

  test('should detach popup if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });

    // Open view in main area.
    const viewInMainArea = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open popup opener view.
    const popupOpenerView = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');

    // Drag popup opener view into peripheral area.
    await popupOpenerView.viewTab.dragTo({grid: 'workbench', region: 'east'});

    // Open popup.
    await popupOpenerView.enterCssClass('testee');
    await popupOpenerView.enterQualifier({component: 'testee'});
    await popupOpenerView.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerView.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(popupPage.popup.locator).toBeVisible();
    await expect(popupPage.outlet.locator).toBeVisible();

    // Maximize the main area.
    await viewInMainArea.viewTab.dblclick();
    await expect(popupPage.popup.locator).not.toBeVisible();
    await expect(popupPage.outlet.locator).not.toBeVisible();

    // Restore the layout.
    await viewInMainArea.viewTab.dblclick();
    await expect(popupPage.popup.locator).toBeVisible();
    await expect(popupPage.outlet.locator).toBeVisible();
  });

  // TODO [#488]: Implement test for feature #488.
  test('should detach dialog if contextual view is not active', async () => {
    expect(true).toBe(true);
  });

  // TODO [#488]: Implement test for feature #488.
  test('should detach dialog if contextual view is opened in peripheral area and the main area is maximized', async () => {
    expect(true).toBe(true);
  });
});
