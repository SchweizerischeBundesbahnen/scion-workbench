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
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

test.describe('Workbench View Tab', () => {

  test('should close context menu when view microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
      },
    });

    // Open some views for the context menu not to overlay the input field of the test view.
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();

    // Open test view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'input-field'}, {cssClass: 'testee'});
    const testPage = new InputFieldTestPagePO(appPO, {cssClass: 'testee'});

    // Open context menu.
    const contextMenu = await testPage.view.tab.openContextMenu();
    await expect(contextMenu.locator).toBeAttached();

    // Focus view.
    await testPage.clickInputField();

    // Expect the context menu to be closed.
    await expect(contextMenu.locator).not.toBeAttached();

    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should close context menu when popup microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
      },
    });

    // Open test view.
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open test popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'input-field'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.open();

    const testPage = new InputFieldTestPagePO(appPO, {cssClass: 'testee'});

    // Open context menu.
    const contextMenu = await viewPage.view.tab.openContextMenu();
    await expect(contextMenu.locator).toBeAttached();

    // Focus popup.
    await testPage.clickInputField();

    // Expect the context menu to be closed.
    await expect(contextMenu.locator).not.toBeAttached();

    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });
});
