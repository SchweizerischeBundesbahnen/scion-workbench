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
import {InputFieldTestPagePO as MicrofrontendInputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';

test.describe('Workbench View Tab', () => {

  test('should close context menu when view microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open some views for the context menu not to overlay the input field of the test view.
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();

    // Open test view.
    const testPagePO = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    // Open context menu.
    const contextMenuPO = await testPagePO.view.viewTab.openContextMenu();
    await expect(await contextMenuPO.isOpened()).toBe(true);

    // When focusing the view.
    await testPagePO.clickInputField();
    // Expect the context menu to be closed.
    await expect(await contextMenuPO.isOpened()).toBe(false);
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(await testPagePO.isInputFieldActiveElement()).toBe(true);
  });

  test('should close context menu when popup microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view.
    const viewPagePO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open test popup.
    const testPagePO = await MicrofrontendInputFieldTestPagePO.openInPopup(appPO, microfrontendNavigator, {closeOnFocusLost: false});

    // Open context menu.
    const contextMenuPO = await viewPagePO.view.viewTab.openContextMenu();
    await expect(await contextMenuPO.isOpened()).toBe(true);

    // When focusing the popup.
    await testPagePO.clickInputField();
    // Expect the context menu to be closed.
    await expect(await contextMenuPO.isOpened()).toBe(false);
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(await testPagePO.isInputFieldActiveElement()).toBe(true);
  });
});
