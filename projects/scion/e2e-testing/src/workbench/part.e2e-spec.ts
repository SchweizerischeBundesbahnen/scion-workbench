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
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench Part', () => {

  test('should close view list menu when view gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const testPagePO = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);

    // Open view list menu.
    const viewListMenuPO = await testPagePO.view.part.openViewListMenu();
    await expect(await viewListMenuPO.isOpened()).toBe(true);

    // When focusing the view.
    await testPagePO.clickInputField();
    // Expect the view list menu to be closed.
    await expect(await viewListMenuPO.isOpened()).toBe(false);
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(await testPagePO.isInputFieldActiveElement()).toBe(true);
  });

  test('should close view list menu when popup gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test popup.
    const testPagePO = await InputFieldTestPagePO.openInPopup(appPO, workbenchNavigator, {closeOnFocusLost: false});

    // Open view list menu.
    const viewListMenuPO = await viewPagePO.viewPO.part.openViewListMenu();
    await expect(await viewListMenuPO.isOpened()).toBe(true);

    // When focusing the popup.
    await testPagePO.clickInputField();
    // Expect the view list menu to be closed.
    await expect(await viewListMenuPO.isOpened()).toBe(false);
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(await testPagePO.isInputFieldActiveElement()).toBe(true);
  });
});
