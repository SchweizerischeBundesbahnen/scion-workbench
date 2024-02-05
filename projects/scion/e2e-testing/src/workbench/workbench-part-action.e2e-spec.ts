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
import {LayoutPagePO} from './page-object/layout-page.po';

test.describe('Workbench Part Action', () => {

  test('should contribute action to every part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Switch perspective
    await appPO.switchPerspective('perspective');

    // Prepare layout
    // +------+-----------+-------+
    // | left | main-area | right |
    // +------+-----------+-------+
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addPart('right', {align: 'right', ratio: .25});
    await layoutPage.addView('view-1', {partId: 'left', activateView: true});
    await layoutPage.addView('view-2', {partId: 'right', activateView: true});
    await layoutPage.registerRoute({path: '', outlet: 'view-1', component: 'view-page'}, {title: 'View 1'});
    await layoutPage.registerRoute({path: '', outlet: 'view-2', component: 'view-page'}, {title: 'View 2'});

    // Open page in main area
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await viewPage.view.part.getPartId();

    // Register action
    await layoutPage.registerPartAction('Action', {cssClass: 'e2e-action'});

    // Expect the action to be displayed in every part
    await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).locator).toBeVisible();
  });

  test('should contribute action to parts in the workbench grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Switch perspective
    await appPO.switchPerspective('perspective');

    // Prepare layout
    // +------+-----------+-------+
    // | left | main-area | right |
    // +------+-----------+-------+
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addPart('right', {align: 'right', ratio: .25});
    await layoutPage.addView('view-1', {partId: 'left', activateView: true});
    await layoutPage.addView('view-2', {partId: 'right', activateView: true});
    await layoutPage.registerRoute({path: '', outlet: 'view-1', component: 'view-page'}, {title: 'View 1'});
    await layoutPage.registerRoute({path: '', outlet: 'view-2', component: 'view-page'}, {title: 'View 2'});

    // Open page in main area
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await viewPage.view.part.getPartId();

    // Register action
    await layoutPage.registerPartAction('Action', {grid: 'workbench', cssClass: 'e2e-action'});

    // Expect the action to be displayed in all parts of the workbench grid
    await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
  });

  test('should contribute action to specific part(s)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Switch perspective
    await appPO.switchPerspective('perspective');

    // Prepare layout
    // +------+-----------+-------+
    // | left | main-area | right |
    // +------+-----------+-------+
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addPart('right', {align: 'right', ratio: .25});
    await layoutPage.addView('view-1', {partId: 'left', activateView: true});
    await layoutPage.addView('view-2', {partId: 'right', activateView: true});
    await layoutPage.registerRoute({path: '', outlet: 'view-1', component: 'view-page'}, {title: 'View 1'});
    await layoutPage.registerRoute({path: '', outlet: 'view-2', component: 'view-page'}, {title: 'View 2'});

    // Open page in main area
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await viewPage.view.part.getPartId();

    await test.step('register action in left part', async () => {
      await layoutPage.registerPartAction('Action 1', {partId: 'left', cssClass: 'e2e-action-1'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
    });

    await test.step('register action in left and right part', async () => {
      await layoutPage.registerPartAction('Action 2', {partId: ['left', 'right'], cssClass: 'e2e-action-2'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
    });

    await test.step('register action in main part', async () => {
      await layoutPage.registerPartAction('Action 3', {partId: mainPartId, cssClass: 'e2e-action-3'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the main part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).locator).toBeVisible();
    });
  });

  test('should contribute action to specific views(s)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Switch perspective
    await appPO.switchPerspective('perspective');

    // Prepare layout
    // +------+-----------+-------+
    // | left | main-area | right |
    // +------+-----------+-------+
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addPart('right', {align: 'right', ratio: .25});
    await layoutPage.addView('view-1', {partId: 'left', activateView: true});
    await layoutPage.addView('view-2', {partId: 'left'});
    await layoutPage.addView('view-3', {partId: 'right', activateView: true});
    await layoutPage.addView('view-4', {partId: 'right'});
    await layoutPage.registerRoute({path: '', outlet: 'view-1', component: 'view-page'}, {title: 'View 1'});
    await layoutPage.registerRoute({path: '', outlet: 'view-2', component: 'view-page'}, {title: 'View 2'});
    await layoutPage.registerRoute({path: '', outlet: 'view-3', component: 'view-page'}, {title: 'View 3'});
    await layoutPage.registerRoute({path: '', outlet: 'view-4', component: 'view-page'}, {title: 'View 4'});

    // Open page in main area
    const mainPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await mainPage1.view.part.getPartId();

    await test.step('register action in view-1', async () => {
      await layoutPage.registerPartAction('Action 1', {viewId: 'view-1', cssClass: 'e2e-action-1'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
    });

    await test.step('register action in view-1 and view-3', async () => {
      await layoutPage.registerPartAction('Action 2', {viewId: ['view-1', 'view-3'], cssClass: 'e2e-action-2'});

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
    });

    await test.step('register action in main part', async () => {
      await layoutPage.registerPartAction('Action 3', {viewId: await mainPage1.view.getViewId(), cssClass: 'e2e-action-3'});
      await mainPage1.view.tab.click();

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the main part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).locator).toBeVisible();
    });

    await test.step('change active view tabs', async () => {
      await appPO.view({viewId: 'view-2'}).tab.click();
      await appPO.view({viewId: 'view-4'}).tab.click();
      await appPO.view({viewId: await mainPage2.view.getViewId()}).tab.click();

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the main part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
    });

    await test.step('change active view tabs back', async () => {
      await appPO.view({viewId: 'view-1'}).tab.click();
      await appPO.view({viewId: 'view-3'}).tab.click();
      await appPO.view({viewId: await mainPage1.view.getViewId()}).tab.click();

      // Expect the action-1 to be displayed only in the left part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).locator).not.toBeAttached();

      // Expect the action-2 to be displayed in the left and right parts
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).locator).toBeVisible();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).locator).not.toBeAttached();

      // Expect the action-3 to be displayed only in the main part
      await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).locator).not.toBeAttached();
      await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).locator).toBeVisible();
    });
  });

  test('should contribute action to specific view in the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective']});

    // Switch perspective
    await appPO.switchPerspective('perspective');

    // Prepare layout
    // +------+-----------+-------+
    // | left | main-area | right |
    // +------+-----------+-------+
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addPart('right', {align: 'right', ratio: .25});
    await layoutPage.addView('view-1', {partId: 'left', activateView: true});
    await layoutPage.addView('view-2', {partId: 'right', activateView: true});
    await layoutPage.registerRoute({path: '', outlet: 'view-1', component: 'view-page'}, {title: 'View 1'});
    await layoutPage.registerRoute({path: '', outlet: 'view-2', component: 'view-page'}, {title: 'View 2'});

    // Open page in main area
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await viewPage.view.part.getPartId();

    // Register action
    await layoutPage.registerPartAction('Action', {grid: 'mainArea', viewId: 'view-1', cssClass: 'e2e-action'});

    // Expect the action not to be displayed
    await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();

    // Drag view-1 to main area
    await appPO.view({viewId: 'view-1'}).tab.dragTo({partId: mainPartId, region: 'center'});

    // Expect the action not to be displayed
    await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).locator).toBeVisible();

    // Drag view-1 to right part
    await appPO.view({viewId: 'view-1'}).tab.dragTo({partId: 'right', region: 'center'});

    // Expect the action not to be displayed
    await expect(appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view to the center', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'center'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view quickly to the center', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'center'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view to the north', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'north'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view quickly to the north', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'north'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view to the east', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'east'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view quickly to the east', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'east'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view to the south', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view quickly to the south', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view to the west', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'west'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions when dragging view quickly to the west', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'west'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).locator).toBeVisible();
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).locator).not.toBeAttached();
  });

  test('should display actions after drop', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();

    // Register view-specific action
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 100});
    const newPartId = await viewPage.view.part.getPartId();

    // Expect action to display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: newPartId}).action({cssClass: 'e2e-action'}).locator).toBeVisible();
  });

  test('should display actions after drop when dragging quickly', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();

    // Register view-specific action
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Action', {viewId: await viewPage.view.getViewId(), cssClass: 'e2e-action'});

    // Drag the view
    await viewPage.view.tab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 1});
    const newPartId = await viewPage.view.part.getPartId();

    // Expect action to display
    await expect(appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: newPartId}).action({cssClass: 'e2e-action'}).locator).toBeVisible();
  });
});
