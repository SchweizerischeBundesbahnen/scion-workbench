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
    expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);
    expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);
    expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);
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
    expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);
    expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);
    expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
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
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
    });

    await test.step('register action in left and right part', async () => {
      await layoutPage.registerPartAction('Action 2', {partId: ['left', 'right'], cssClass: 'e2e-action-2'});

      // Expect the action-1 to be displayed only in the left part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);

      // Expect the action-2 to be displayed in the left and right parts
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);
    });

    await test.step('register action in main part', async () => {
      await layoutPage.registerPartAction('Action 3', {partId: mainPartId, cssClass: 'e2e-action-3'});

      // Expect the action-1 to be displayed only in the left part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);

      // Expect the action-2 to be displayed in the left and right parts
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);

      // Expect the action-3 to be displayed only in the main part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(true);
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
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
    });

    await test.step('register action in view-1 and view-3', async () => {
      await layoutPage.registerPartAction('Action 2', {viewId: ['view-1', 'view-3'], cssClass: 'e2e-action-2'});

      // Expect the action-1 to be displayed only in the left part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);

      // Expect the action-2 to be displayed in the left and right parts
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);
    });

    await test.step('register action in main part', async () => {
      await layoutPage.registerPartAction('Action 3', {viewId: mainPage1.viewId, cssClass: 'e2e-action-3'});
      await mainPage1.viewTab.click();

      // Expect the action-1 to be displayed only in the left part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);

      // Expect the action-2 to be displayed in the left and right parts
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);

      // Expect the action-3 to be displayed only in the main part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(true);
    });

    await test.step('change active view tabs', async () => {
      await appPO.view({viewId: 'view-2'}).viewTab.click();
      await appPO.view({viewId: 'view-4'}).viewTab.click();
      await appPO.view({viewId: mainPage2.viewId}).viewTab.click();

      // Expect the action-1 to be displayed only in the left part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);

      // Expect the action-2 to be displayed in the left and right parts
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);

      // Expect the action-3 to be displayed only in the main part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
    });

    await test.step('change active view tabs back', async () => {
      await appPO.view({viewId: 'view-1'}).viewTab.click();
      await appPO.view({viewId: 'view-3'}).viewTab.click();
      await appPO.view({viewId: mainPage1.viewId}).viewTab.click();

      // Expect the action-1 to be displayed only in the left part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-1'}).isVisible()).toBe(false);

      // Expect the action-2 to be displayed in the left and right parts
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(true);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-2'}).isVisible()).toBe(false);

      // Expect the action-3 to be displayed only in the main part
      expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(false);
      expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-3'}).isVisible()).toBe(true);
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
    expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);

    // Drag view-1 to main area
    await appPO.view({viewId: 'view-1'}).viewTab.dragTo({partId: mainPartId, region: 'center'});

    // Expect the action not to be displayed
    expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);

    // Drag view-1 to right part
    await appPO.view({viewId: 'view-1'}).viewTab.dragTo({partId: 'right', region: 'center'});

    // Expect the action not to be displayed
    expect(await appPO.part({partId: 'left'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    expect(await appPO.part({partId: 'right'}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view to the center', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'center'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view quickly to the center', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'center'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view to the north', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'north'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view quickly to the north', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'north'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view to the east', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'east'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view quickly to the east', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'east'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view to the south', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view quickly to the south', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view to the west', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'west'}, {steps: 100, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions when dragging view quickly to the west', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Global Action', {cssClass: 'e2e-action-global'});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();
    await layoutPage.registerPartAction('View Action', {viewId: viewPage.viewId, cssClass: 'e2e-action-view'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'west'}, {steps: 1, performDrop: false});

    // Expect the global action to still display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-global'}).isVisible()).toBe(true);
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action-view'}).isVisible()).toBe(false);
  });

  test('should display actions after drop', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();

    // Register view-specific action
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Action', {viewId: viewPage.viewId, cssClass: 'e2e-action'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 100});
    const newPartId = await viewPage.viewTab.part.getPartId();

    // Expect action to display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    await expect(await appPO.part({partId: newPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);
  });

  test('should display actions after drop when dragging quickly', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open a view
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const mainPartId = await appPO.activePart({inMainArea: true}).getPartId();

    // Register view-specific action
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('Action', {viewId: viewPage.viewId, cssClass: 'e2e-action'});

    // Drag the view
    await viewPage.viewTab.dragTo({partId: await viewPage.view.part.getPartId(), region: 'south'}, {steps: 1});
    const newPartId = await viewPage.viewTab.part.getPartId();

    // Expect action to display
    await expect(await appPO.part({partId: mainPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(false);
    await expect(await appPO.part({partId: newPartId}).action({cssClass: 'e2e-action'}).isVisible()).toBe(true);
  });
});
