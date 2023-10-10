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
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

test.describe('Contextual Workbench View', () => {

  test('should detach message box if contextual view is not active', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open message box.
    const messageBoxOpenerView = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await messageBoxOpenerView.enterCssClass('testee');
    await messageBoxOpenerView.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(messageBox.locator).toBeVisible();

    // Open another view.
    await appPO.openNewViewTab();
    await expect(messageBox.locator).not.toBeVisible();

    // Activate message box opener view.
    await messageBoxOpenerView.viewTab.click();
    await expect(messageBox.locator).toBeVisible();
  });

  test('should detach message box if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view in main area.
    const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open message box opener view.
    const messageBoxOpenerView = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);

    // Drag message box opener view into peripheral area.
    await messageBoxOpenerView.viewTab.dragTo({grid: 'workbench', region: 'east'});

    // Open message box.
    await messageBoxOpenerView.enterCssClass('testee');
    await messageBoxOpenerView.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(messageBox.locator).toBeVisible();

    // Maximize the main area.
    await viewPageInMainArea.viewTab.dblclick();
    await expect(messageBoxOpenerView.view.locator).not.toBeVisible();
    await expect(messageBox.locator).not.toBeVisible();

    // Restore the layout.
    await viewPageInMainArea.viewTab.dblclick();
    await expect(messageBoxOpenerView.view.locator).toBeVisible();
    await expect(messageBox.locator).toBeVisible();
  });

  test('should detach popup if contextual view is not active', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open popop.
    const popupOpenerView = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerView.enterCssClass('testee');
    await popupOpenerView.selectPopupComponent('popup-page');
    await popupOpenerView.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerView.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});
    await expect(popup.locator).toBeVisible();

    // Open another view.
    await appPO.openNewViewTab();
    await expect(popup.locator).not.toBeVisible();

    // Activate popup opener view.
    await popupOpenerView.viewTab.click();
    await expect(popup.locator).toBeVisible();
  });

  test('should detach popup if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view in main area.
    const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open popup opener view.
    const popupOpenerView = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);

    // Drag popup opener view into peripheral area.
    await popupOpenerView.viewTab.dragTo({grid: 'workbench', region: 'east'});

    // Open popup.
    await popupOpenerView.enterCssClass('testee');
    await popupOpenerView.selectPopupComponent('popup-page');
    await popupOpenerView.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerView.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});
    await expect(popup.locator).toBeVisible();

    // Maximize the main area.
    await viewPageInMainArea.viewTab.dblclick();
    await expect(popupOpenerView.view.locator).not.toBeVisible();
    await expect(popup.locator).not.toBeVisible();

    // Restore the layout.
    await viewPageInMainArea.viewTab.dblclick();
    await expect(popupOpenerView.view.locator).toBeVisible();
    await expect(popup.locator).toBeVisible();
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
