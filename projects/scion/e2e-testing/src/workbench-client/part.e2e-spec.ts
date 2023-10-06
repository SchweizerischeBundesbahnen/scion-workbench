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
import {InputFieldTestPagePO as MicrofrontendInputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {waitUntilStable} from '../helper/testing.util';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench Part', () => {

  test('should activate part when view microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view "left".
    const leftTestPage = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    // Open test view "right".
    const rightTestPage = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    // Move test view to the right
    await rightTestPage.view.viewTab.dragTo({partId: await appPO.activePart({inMainArea: true}).getPartId(), region: 'east'});

    // Capture part and view identities.
    const leftPartId = await leftTestPage.view.part.getPartId();
    const rightPartId = await rightTestPage.view.part.getPartId();
    const leftViewId = await leftTestPage.view.getViewId();
    const rightViewId = await rightTestPage.view.getViewId();

    // Expect right part to be activated.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: leftPartId,
            views: [{id: leftViewId}],
            activeViewId: leftViewId,
          }),
          child2: new MPart({
            id: rightPartId,
            views: [{id: rightViewId}],
            activeViewId: rightViewId,
          }),
        }),
        activePartId: rightPartId,
      },
    });

    // When clicking left test view.
    await leftTestPage.clickInputField();
    await waitUntilStable(() => appPO.activePart({inMainArea: true}).getPartId());

    // Expect left part to be activated.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: leftPartId,
            views: [{id: leftViewId}],
            activeViewId: leftViewId,
          }),
          child2: new MPart({
            id: rightPartId,
            views: [{id: rightViewId}],
            activeViewId: rightViewId,
          }),
        }),
        activePartId: leftPartId,
      },
    });
  });

  test('should close view list menu when view microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view.
    const testPage = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);

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

  test('should close view list menu when popup microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view.
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open test popup.
    const testPage = await MicrofrontendInputFieldTestPagePO.openInPopup(appPO, microfrontendNavigator, {closeOnFocusLost: false});

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
