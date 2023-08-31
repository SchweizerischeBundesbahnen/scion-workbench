/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {WorkbenchNavigator} from './workbench-navigator';
import {LayoutPagePO} from './page-object/layout-page.po';
import {getPerspectiveId} from '../helper/testing.util';

test.describe('Workbench View', () => {

  test('should allow moving a named view in the workbench grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Define perspective with a view in the workbench grid.
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {align: 'left', ratio: .25});
    await layoutPagePO.addView('other', {partId: 'left', activateView: true});
    await layoutPagePO.addView('testee', {partId: 'left', activateView: true});
    await layoutPagePO.registerRoute({path: '', component: 'view-page', outlet: 'other'});
    await layoutPagePO.registerRoute({path: '', component: 'view-page', outlet: 'testee'});

    // Move test view to new window.
    const contextMenuPO = await appPO.view({viewId: 'testee'}).viewTab.openContextMenu();
    const [newAppPO] = await Promise.all([
      appPO.waitForWindow(async page => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null),
      contextMenuPO.clickMoveToNewWindow(),
    ]);
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Register route for named view.
    const newWindowLayoutPagePO = await newWindow.workbenchNavigator.openInNewTab(LayoutPagePO);
    await newWindowLayoutPagePO.registerRoute({path: '', component: 'view-page', outlet: 'testee'});
    await newWindowLayoutPagePO.viewTabPO.close();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'testee'}],
          activeViewId: 'testee',
        }),
      },
    });

    // Expect test view to display.
    await expect(new ViewPagePO(newWindow.appPO, 'testee').locator).toBeVisible();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({id: 'left', views: [{id: 'other'}], activeViewId: 'other'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: layoutPagePO.viewId}],
          activeViewId: layoutPagePO.viewId,
        }),
      },
    });
  });

  test('should allow moving an unnamed view in the workbench grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Define perspective with a view in the workbench grid.
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {align: 'left', ratio: .25});
    await layoutPagePO.addView('other', {partId: 'left', activateView: true});
    await layoutPagePO.registerRoute({path: '', component: 'view-page', outlet: 'other'});

    // Open test view in workbench grid.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterBlankPartId('left');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigate();
    await routerPagePO.viewTabPO.close();

    const testViewPagePO = appPO.view({cssClass: 'testee'});
    const testViewId = await testViewPagePO.getViewId();

    // Move test view to new window.
    const contextMenuPO = await appPO.view({viewId: testViewId}).viewTab.openContextMenu();
    const [newAppPO] = await Promise.all([
      appPO.waitForWindow(async page => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null),
      contextMenuPO.clickMoveToNewWindow(),
    ]);
    const newWindow = {
      appPO: newAppPO,
    };

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testViewId}],
          activeViewId: testViewId,
        }),
      },
    });

    // Expect test view to display.
    await expect(new ViewPagePO(newWindow.appPO, testViewId).locator).toBeVisible();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({id: 'left', views: [{id: 'other'}], activeViewId: 'other'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: layoutPagePO.viewId}],
          activeViewId: layoutPagePO.viewId,
        }),
      },
    });
  });

  test('should allow moving a named view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register route of named view
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.registerRoute({path: '', component: 'view-page', outlet: 'testee'});

    // Open test view in main area.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('<empty>');
    await routerPagePO.enterTarget('testee');
    await routerPagePO.clickNavigate();

    // Move test view to new window.
    const contextMenuPO = await appPO.view({viewId: 'testee'}).viewTab.openContextMenu();
    const [newAppPO] = await Promise.all([
      appPO.waitForWindow(async page => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null),
      contextMenuPO.clickMoveToNewWindow(),
    ]);
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Register route for named view.
    const newWindowLayoutPagePO = await newWindow.workbenchNavigator.openInNewTab(LayoutPagePO);
    await newWindowLayoutPagePO.registerRoute({path: '', component: 'view-page', outlet: 'testee'});
    await newWindowLayoutPagePO.viewTabPO.close();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'testee'}],
          activeViewId: 'testee',
        }),
      },
    });

    // Expect test view to display.
    await expect(new ViewPagePO(newWindow.appPO, 'testee').locator).toBeVisible();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: layoutPagePO.viewId}, {id: routerPagePO.viewId}],
          activeViewId: routerPagePO.viewId,
        }),
      },
    });
  });

  test('should allow moving an unnamed view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigate();

    const testViewPagePO = appPO.view({cssClass: 'testee'});
    const testViewId = await testViewPagePO.getViewId();

    // Move test view to new window.
    const contextMenuPO = await testViewPagePO.viewTab.openContextMenu();
    const [newAppPO] = await Promise.all([
      appPO.waitForWindow(async page => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null),
      contextMenuPO.clickMoveToNewWindow(),
    ]);
    const newWindow = {
      appPO: newAppPO,
    };

    // Expect test view to be moved to the new window.
    await expect(newWindow.appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testViewId}],
          activeViewId: testViewId,
        }),
      },
    });

    // Expect test view to display.
    await expect(new ViewPagePO(newWindow.appPO, testViewId).locator).toBeVisible();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: routerPagePO.viewId}],
          activeViewId: routerPagePO.viewId,
        }),
      },
    });
  });

  test('should memoize layout of anonymous perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('test-view');
    await routerPagePO.clickNavigate();
    const testViewPagePO = appPO.view({cssClass: 'test-view'});
    const testViewId = await testViewPagePO.getViewId();

    // Move test view to new window.
    const contextMenuPO = await testViewPagePO.viewTab.openContextMenu();
    const [newAppPO] = await Promise.all([
      appPO.waitForWindow(async page => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null),
      contextMenuPO.clickMoveToNewWindow(),
    ]);
    const newWindow = {
      appPO: newAppPO,
      page: newAppPO.page,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view in the new browser window.
    const newAppRouterPagePO = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPagePO.enterPath('test-view');
    await newAppRouterPagePO.enterCssClass('peripheral-view');
    await newAppRouterPagePO.enterTarget('blank');
    await newAppRouterPagePO.clickNavigate();
    await newAppRouterPagePO.viewTabPO.close();

    // Move peripheral view to workbench grid.
    const peripheralViewPagePO = newWindow.appPO.view({cssClass: 'peripheral-view'});
    const peripheralViewId = await peripheralViewPagePO.getViewId();
    await peripheralViewPagePO.viewTab.dragTo({grid: 'workbench', region: 'east'});

    // Expect peripheral view to be dragged to the workbench grid.
    await expect(newWindow.appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .8,
          child1: new MPart({id: MAIN_AREA}),
          child2: new MPart({
            views: [{id: peripheralViewId}],
            activeViewId: peripheralViewId,
          }),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testViewId}],
          activeViewId: testViewId,
        }),
      },
    });

    // Capture name of anonymous perspective.
    const anonymousPerspectiveName = await getPerspectiveId(newWindow.page);

    // Register new perspective.
    const perspectivePagePO = await newWindow.workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePagePO.registerPerspective({
      id: 'test-blank',
      data: {
        label: 'blank',
      },
      parts: [{id: MAIN_AREA}],
    });
    await perspectivePagePO.viewTabPO.close();

    // Switch to the new perspective.
    await newWindow.appPO.header.perspectiveToggleButton({perspectiveId: 'test-blank'}).click();

    // Expect the layout to be blank.
    await expect(newWindow.appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testViewId}],
          activeViewId: testViewId,
        }),
      },
    });

    // Switch back to the anonymous perspective.
    await newWindow.appPO.header.perspectiveToggleButton({perspectiveId: anonymousPerspectiveName}).click();

    // Expect the layout of the anonymous perspective to be restored.
    await expect(newWindow.appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .8,
          child1: new MPart({id: MAIN_AREA}),
          child2: new MPart({
            views: [{id: peripheralViewId}],
            activeViewId: peripheralViewId,
          }),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testViewId}],
          activeViewId: testViewId,
        }),
      },
    });
  });

  test('should not store layout of anonymous perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterCssClass('test-view');
    await routerPagePO.clickNavigate();
    const testViewPagePO = appPO.view({cssClass: 'test-view'});
    const testViewId = await testViewPagePO.getViewId();

    // Move test view to new window.
    const contextMenuPO = await testViewPagePO.viewTab.openContextMenu();
    const [newAppPO] = await Promise.all([
      appPO.waitForWindow(async page => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null),
      contextMenuPO.clickMoveToNewWindow(),
    ]);
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view.
    const newAppRouterPagePO = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPagePO.enterPath('test-view');
    await newAppRouterPagePO.enterCssClass('peripheral-view');
    await newAppRouterPagePO.enterTarget('blank');
    await newAppRouterPagePO.clickNavigate();
    await newAppRouterPagePO.viewTabPO.close();

    // Move peripheral view to workbench grid.
    const peripheralViewPagePO = newWindow.appPO.view({cssClass: 'peripheral-view'});
    const peripheralViewId = await peripheralViewPagePO.getViewId();
    await peripheralViewPagePO.viewTab.dragTo({grid: 'workbench', region: 'east'});

    // Expect peripheral view to be dragged to the workbench grid.
    await expect(newWindow.appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .8,
          child1: new MPart({id: MAIN_AREA}),
          child2: new MPart({
            views: [{id: peripheralViewId}],
            activeViewId: peripheralViewId,
          }),
        }),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testViewId}],
          activeViewId: testViewId,
        }),
      },
    });

    // Reload the new browser window.
    await newWindow.appPO.reload();

    // Expect the layout of the workbench grid not to be restored.
    await expect(newWindow.appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: testViewId}],
          activeViewId: testViewId,
        }),
      },
    });
  });
});
