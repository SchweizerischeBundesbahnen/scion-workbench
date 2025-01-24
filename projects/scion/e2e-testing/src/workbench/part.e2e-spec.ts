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
import {expectPart} from '../matcher/part-matcher';
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

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['test-part'])
      .navigatePart('part.right', ['test-part']),
    );

    // Expect left part to display the part page.
    const leftPart = appPO.part({partId: 'part.left'});
    await expectPart(leftPart).toDisplayComponent(PartPagePO.selector);

    // Expect right part to display the part page.
    const rightPart = appPO.part({partId: 'part.right'});
    await expectPart(rightPart).toDisplayComponent(PartPagePO.selector);
  });

  test('should navigate the main area part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout.navigatePart(MAIN_AREA, ['test-part']));

    // Expect main area part to display the part page.
    const mainAreaPart = appPO.part({partId: MAIN_AREA});
    await expectPart(mainAreaPart).toDisplayComponent(PartPagePO.selector);

    // Open view in main area.
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.100', {partId: 'part.initial'}),
    );

    // Expect view to display.
    await expect(appPO.view({viewId: 'view.100'}).locator).toBeVisible();
    await expectPart(mainAreaPart).not.toDisplayComponent();

    // Close the view.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect main area part to display the part page.
    await expectPart(mainAreaPart).toDisplayComponent(PartPagePO.selector);
  });

  test('should not remove "navigated" part when removing last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.101', {partId: 'part.left'})
      .addView('view.102', {partId: 'part.right'})
      .navigatePart('part.right', ['test-part']),
    );

    const part = appPO.part({partId: 'part.right'});
    await expectPart(part).not.toDisplayComponent();

    // Close the last view of right part.
    await appPO.view({viewId: 'view.102'}).tab.close();

    // Expect part to display the part page.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);
  });

  /**
   * This test verifies the main area grid not to be removed from the URL if no views are opened in the main area.
   */
  test('should support main area to have a single "navigated" part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout
      .navigatePart('part.initial', ['test-part'])
      .addView('view.100', {partId: 'part.initial'}),
    );

    // Close the last view of the main area.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect part to display the part page.
    const part = appPO.part({partId: 'part.initial'});
    await expectPart(part).toDisplayComponent(PartPagePO.selector);
  });

  test('should navigate from path-based route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', ['test-part']), // Open part page as path-based route.
    );

    // Navigate to path-based route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', ['test-part', {some: 'param'}]));

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect part to display path-based route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {
        path: 'test-part',
        navigationHint: '',
      },
    );
    await expect.poll(() => testeePartPage.getParams()).toMatchObject({some: 'param'});
  });

  test('should navigate from path-based route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', ['test-part']), // Open part page as path-based route.
    );

    // Navigate to empty-path route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', [], {hint: 'test-part'}));

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect part to display empty-path route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {
        path: '',
        navigationHint: 'test-part',
      },
    );
  });

  test('should navigate from empty-path route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', [], {hint: 'test-part'}), // Open part page as empty-path route.
    );

    // Navigate to empty-path route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', [], {hint: 'test-part', data: {some: 'data'}}));

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect part to display empty-path route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {
        path: '',
        navigationHint: 'test-part',
      },
    );
    await expect.poll(() => testeePartPage.getNavigationData()).toMatchObject({some: 'data'});
  });

  test('should navigate from empty-path route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', [], {hint: 'test-part'}), // Open part page as empty-path route.
    );

    // Navigate to path-based route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', ['test-part']));

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect part to display path-based route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {
        path: 'test-part',
        navigationHint: '',
      },
    );
  });
});
