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
import {expectPartPage} from '../matcher/part-page-matcher';
import {PartPagePO} from './page-object/part-page.po';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench Part', () => {

  test('should close view list menu when view gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);

    // Open view list menu.
    const viewListMenu = await testPage.view.part.bar.openViewListMenu();
    await expect(viewListMenu.locator).toBeAttached();

    // When focusing the view.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(viewListMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should close view list menu when popup gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test popup.
    const testPage = await InputFieldTestPagePO.openInPopup(appPO, workbenchNavigator, {closeOnFocusLost: false});

    // Open view list menu.
    const viewListMenu = await viewPage.view.part.bar.openViewListMenu();
    await expect(viewListMenu.locator).toBeAttached();

    // When focusing the popup.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(viewListMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should navigate parts', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['test-part'])
      .navigatePart('part.right', ['test-part']),
    );

    // Expect left part to display the part page.
    const leftPartPage = new PartPagePO(appPO, {partId: 'part.left'});
    await expectPartPage(leftPartPage).toBeVisible();

    // Expect right part to display the part page.
    const rightPartPage = new PartPagePO(appPO, {partId: 'part.right'});
    await expectPartPage(rightPartPage).toBeVisible();
  });

  test('should navigate the main area part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.main'});

    await workbenchNavigator.modifyLayout(layout => layout.navigatePart(MAIN_AREA, ['test-part']));

    // Expect main area part to display the part page.
    const partPage = new PartPagePO(appPO, {partId: MAIN_AREA});
    await expectPartPage(partPage).toBeVisible();

    // Open view in main area.
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.100', {partId: 'part.main'}),
    );

    // Expect view to display.
    await expect(appPO.view({viewId: 'view.100'}).locator).toBeVisible();

    // Close the view.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect main area part to display the part page.
    await expectPartPage(partPage).toBeVisible();
  });

  test('should not remove "navigated" part when removing last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.101', {partId: 'part.left'})
      .addView('view.102', {partId: 'part.right'})
      .navigatePart('part.right', ['test-part']),
    );

    // Close the last view of right part.
    await appPO.view({viewId: 'view.102'}).tab.close();

    // Expect part to display the part page.
    const partPage = new PartPagePO(appPO, {partId: 'part.right'});
    await expectPartPage(partPage).toBeVisible();
  });

  /**
   * This test verifies the main area grid not to be removed from the URL if no views are opened in the main area.
   */
  test('should support main area to have a single "navigated" part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.main'});

    await workbenchNavigator.modifyLayout(layout => layout
      .navigatePart('part.main', ['test-part'])
      .addView('view.100', {partId: 'part.main'}),
    );

    // Close the last view of the main area.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect part to display the part page.
    const partPage = new PartPagePO(appPO, {partId: 'part.main'});
    await expectPartPage(partPage).toBeVisible();
  });
});
