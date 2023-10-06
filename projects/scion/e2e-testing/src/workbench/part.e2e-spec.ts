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
    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);

    // Open view list menu.
    const viewListMenu = await testPage.view.part.openViewListMenu();
    await expect(await viewListMenu.isOpened()).toBe(true);

    // When focusing the view.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(await viewListMenu.isOpened()).toBe(false);
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(await testPage.isInputFieldActiveElement()).toBe(true);
  });

  test('should close view list menu when popup gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test popup.
    const testPage = await InputFieldTestPagePO.openInPopup(appPO, workbenchNavigator, {closeOnFocusLost: false});

    // Open view list menu.
    const viewListMenu = await viewPage.view.part.openViewListMenu();
    await expect(await viewListMenu.isOpened()).toBe(true);

    // When focusing the popup.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(await viewListMenu.isOpened()).toBe(false);
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(await testPage.isInputFieldActiveElement()).toBe(true);
  });
});
