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
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';

test.describe('Workbench Part Action', () => {

  test('should contribute action to every part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25})
      .addView('view.101', {partId: 'part.left', activateView: true})
      .addView('view.102', {partId: 'part.right', activateView: true}),
    );

    // Open page in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);

    // Register action
    await layoutPage.registerPartAction('Action', {cssClass: 'e2e-action'});

    // Expect the action to be displayed in every part
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();
  });

  test('should contribute action to parts in the main grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25})
      .addView('view.101', {partId: 'part.left', activateView: true})
      .addView('view.102', {partId: 'part.right', activateView: true}),
    );

    // Open page in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);

    // Register action
    await layoutPage.registerPartAction('Action', {grid: 'main', cssClass: 'e2e-action'});

    // Expect the action to be displayed in all parts of the main grid
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
  });

  test('should contribute action to specific part(s)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25})
      .addView('view.101', {partId: 'part.left', activateView: true})
      .addView('view.102', {partId: 'part.right', activateView: true}),
    );

    // Open page in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);

    await test.step('register action in left part', async () => {
      await layoutPage.registerPartAction('Action 1', {partId: 'part.left', cssClass: 'e2e-action-1'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
    });

    await test.step('register action in left and right part', async () => {
      await layoutPage.registerPartAction('Action 2', {partId: ['part.left', 'part.right'], cssClass: 'e2e-action-2'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
    });

    await test.step('register action in initial part', async () => {
      await layoutPage.registerPartAction('Action 3', {partId: 'part.initial', cssClass: 'e2e-action-3'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the initial part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-3'}).locator).toBeVisible();
    });
  });

  test('should contribute action to specific views(s)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25})
      .addView('view.101', {partId: 'part.left', activateView: true})
      .addView('view.102', {partId: 'part.left'})
      .addView('view.103', {partId: 'part.right', activateView: true})
      .addView('view.104', {partId: 'part.right'}),
    );

    // Open pages in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

    await test.step('register action in view.101', async () => {
      await layoutPage.registerPartAction('Action 1', {viewId: 'view.101', cssClass: 'e2e-action-1'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
    });

    await test.step('register action in view.101 and view.103', async () => {
      await layoutPage.registerPartAction('Action 2', {viewId: ['view.101', 'view.103'], cssClass: 'e2e-action-2'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
    });

    await test.step('register action in initial part', async () => {
      await layoutPage.registerPartAction('Action 3', {viewId: await viewPage1.view.getViewId(), cssClass: 'e2e-action-3'});
      await viewPage1.view.tab.click();

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the initial part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-3'}).locator).toBeVisible();
    });

    await test.step('change active view tabs', async () => {
      await appPO.view({viewId: 'view.102'}).tab.click();
      await appPO.view({viewId: 'view.104'}).tab.click();
      await appPO.view({viewId: await viewPage2.view.getViewId()}).tab.click();

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the initial part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
    });

    await test.step('change active view tabs back', async () => {
      await appPO.view({viewId: 'view.101'}).tab.click();
      await appPO.view({viewId: 'view.103'}).tab.click();
      await appPO.view({viewId: await viewPage1.view.getViewId()}).tab.click();

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the initial part
      await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-3'}).locator).toBeVisible();
    });
  });

  test('should contribute action to specific view in the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25})
      .addView('view.101', {partId: 'part.left', activateView: true})
      .addView('view.102', {partId: 'part.right', activateView: true}),
    );

    // Open page in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);

    // Register action
    await layoutPage.registerPartAction('Action', {grid: 'mainArea', viewId: 'view.101', cssClass: 'e2e-action'});

    // Expect the action not to be displayed
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();

    // Drag view.101 to main area
    const dragHandle1 = await appPO.view({viewId: 'view.101'}).tab.startDrag();
    await dragHandle1.dragToPart('part.initial', {region: 'center'});
    await dragHandle1.drop();

    // Expect the action not to be displayed
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();

    // Drag view.101 to right part
    const dragHandle2 = await appPO.view({viewId: 'view.101'}).tab.startDrag();
    await dragHandle2.dragToPart('part.right', {region: 'center'});
    await dragHandle2.drop();

    // Expect the action not to be displayed
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view out of the tabbar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    const dragHandle = await viewPage.view.tab.startDrag();
    await dragHandle.dragTo({deltaX: 0, deltaY: 500});

    // Expect the global action to still display
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view quickly out of the tabbar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    const dragHandle = await viewPage.view.tab.startDrag();
    await dragHandle.dragTo({deltaX: 0, deltaY: 500}, {steps: 1});

    // Expect the global action to still display
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions after drop', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Register view-specific action
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action'});

    // Drag the view
    const dragHandle = await viewPage.view.tab.startDrag();
    await dragHandle.dragTo({deltaX: 0, deltaY: 500});

    await dragHandle.drop();
    const newPartId = await viewPage.view.part.getPartId();

    // Expect action to display
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: newPartId}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();
  });

  test('should display actions after drop when dragging quickly', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Register view-specific action
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action'});

    // Drag the view
    const dragHandle = await viewPage.view.tab.startDrag();
    await dragHandle.dragTo({deltaX: 0, deltaY: 500}, {steps: 1});
    await dragHandle.drop();
    const newPartId = await viewPage.view.part.getPartId();

    // Expect action to display
    await expect(appPO.part({partId: 'part.initial'}).bar.action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: newPartId}).bar.action({cssClass: 'e2e-action'}).locator).toBeVisible();
  });
});
