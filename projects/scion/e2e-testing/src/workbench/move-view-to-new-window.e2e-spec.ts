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
import {expectView} from '../matcher/view-matcher';

test.describe('Workbench View', () => {

  test('should allow moving a named view in the workbench grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Define perspective with a view in the workbench grid.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addView('other', {partId: 'left', activateView: true});
    await layoutPage.addView('testee', {partId: 'left', activateView: true});
    await layoutPage.registerRoute({path: '', component: 'view-page', outlet: 'other'});
    await layoutPage.registerRoute({path: '', component: 'view-page', outlet: 'testee'});

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'testee'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Register route for named view.
    const newWindowLayoutPage = await newWindow.workbenchNavigator.openInNewTab(LayoutPagePO);
    await newWindowLayoutPage.registerRoute({path: '', component: 'view-page', outlet: 'testee'});
    await newWindowLayoutPage.view.tab.close();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
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
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: 'testee'});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
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
          views: [{id: await layoutPage.view.getViewId()}],
          activeViewId: await layoutPage.view.getViewId(),
        }),
      },
    });
  });

  test('should allow moving an unnamed view in the workbench grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Define perspective with a view in the workbench grid.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addView('other', {partId: 'left', activateView: true});
    await layoutPage.registerRoute({path: '', component: 'view-page', outlet: 'other'});

    // Open test view in workbench grid.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterBlankPartId('left');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    const testViewPage = appPO.view({cssClass: 'testee'});
    const testViewId = await testViewPage.getViewId();

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: testViewId}).tab.moveToNewWindow();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
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
    const viewPage = new ViewPagePO(newAppPO, {viewId: testViewId});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
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
          views: [{id: await layoutPage.view.getViewId()}],
          activeViewId: await layoutPage.view.getViewId(),
        }),
      },
    });
  });

  test('should allow moving a named view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register route of named view
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerRoute({path: '', component: 'view-page', outlet: 'testee'});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterTarget('testee');
    await routerPage.clickNavigate();

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'testee'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Register route for named view.
    const newWindowLayoutPage = await newWindow.workbenchNavigator.openInNewTab(LayoutPagePO);
    await newWindowLayoutPage.registerRoute({path: '', component: 'view-page', outlet: 'testee'});
    await newWindowLayoutPage.view.tab.close();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
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
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: 'testee'});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [
            {id: await layoutPage.view.getViewId()},
            {id: await routerPage.view.getViewId()},
          ],
          activeViewId: await routerPage.view.getViewId(),
        }),
      },
    });
  });

  test('should allow moving an unnamed view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const testViewPage = appPO.view({cssClass: 'testee'});
    const testViewId = await testViewPage.getViewId();

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
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
    const viewPage = new ViewPagePO(newAppPO, {viewId: testViewId});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: await routerPage.view.getViewId()}],
          activeViewId: await routerPage.view.getViewId(),
        }),
      },
    });
  });

  test('should allow moving a view to another window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1 (path-based view)
    const view1 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
    // Open view 2 (path-based view)
    const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
    // Open view 3 (empty-path view)
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('');
    await routerPage.enterTarget('outlet'); // TODO [WB-LAYOUT] Create test views via layout
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();
    const view3 = appPO.view({viewId: 'outlet'});

    // Move view 1 to a new window
    const newAppPO = await view1.tab.moveToNewWindow();
    // Expect view 1 to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [
            {id: 'view.1'},
          ],
          activeViewId: 'view.1',
        }),
      },
    });
    // Expect view 1 to be removed from the original window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [
            {id: 'view.2'},
            {id: 'outlet'},
          ],
          activeViewId: 'outlet',
        }),
      },
    });

    // Move view 2 to the new window
    await view2.tab.moveTo(await newAppPO.activePart({inMainArea: true}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchIdId(),
    });
    // Expect view 2 to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [
            {id: 'view.1'},
            {id: 'view.2'},
          ],
          activeViewId: 'view.2',
        }),
      },
    });
    // Expect view 2 to be removed from the original window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [
            {id: 'outlet'},
          ],
          activeViewId: 'outlet',
        }),
      },
    });

    // Move view 3 (empty-path view) to the new window
    await view3.tab.moveTo(await newAppPO.activePart({inMainArea: true}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchIdId(),
    });
    // Expect view 3 to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [
            {id: 'view.1'},
            {id: 'view.2'},
            {id: 'outlet'},
          ],
          activeViewId: 'outlet',
        }),
      },
    });
    // Expect view 3 to be removed from the original window.
    await expect(appPO.views()).toHaveCount(0);
  });

  test('should memoize layout of anonymous perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('test-view');
    await routerPage.clickNavigate();

    const testViewPage = appPO.view({cssClass: 'test-view'});
    const testViewId = await testViewPage.getViewId();

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      page: newAppPO.page,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view in the new browser window.
    const newAppRouterPage = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPage.enterPath('test-view');
    await newAppRouterPage.enterCssClass('peripheral-view');
    await newAppRouterPage.enterTarget('blank');
    await newAppRouterPage.clickNavigate();
    await newAppRouterPage.view.tab.close();

    // Move peripheral view to workbench grid.
    const peripheralViewPage = newWindow.appPO.view({cssClass: 'peripheral-view'});
    const peripheralViewId = await peripheralViewPage.getViewId();
    await peripheralViewPage.tab.dragTo({grid: 'workbench', region: 'east'});

    // Expect peripheral view to be dragged to the workbench grid.
    await expect(newWindow.appPO.workbench).toEqualWorkbenchLayout({
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
    const perspectivePage = await newWindow.workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'test-blank',
      data: {
        label: 'blank',
      },
      parts: [{id: MAIN_AREA}],
    });
    await perspectivePage.view.tab.close();

    // Switch to the new perspective.
    await newWindow.appPO.switchPerspective('test-blank');

    // Expect the layout to be blank.
    await expect(newWindow.appPO.workbench).toEqualWorkbenchLayout({
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
    await newWindow.appPO.switchPerspective(anonymousPerspectiveName);

    // Expect the layout of the anonymous perspective to be restored.
    await expect(newWindow.appPO.workbench).toEqualWorkbenchLayout({
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
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('test-view');
    await routerPage.clickNavigate();

    const testViewPage = appPO.view({cssClass: 'test-view'});
    const testViewId = await testViewPage.getViewId();

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view.
    const newAppRouterPage = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPage.enterPath('test-view');
    await newAppRouterPage.enterCssClass('peripheral-view');
    await newAppRouterPage.enterTarget('blank');
    await newAppRouterPage.clickNavigate();
    await newAppRouterPage.view.tab.close();

    // Move peripheral view to workbench grid.
    const peripheralViewPage = newWindow.appPO.view({cssClass: 'peripheral-view'});
    const peripheralViewId = await peripheralViewPage.getViewId();
    await peripheralViewPage.tab.dragTo({grid: 'workbench', region: 'east'});

    // Expect peripheral view to be dragged to the workbench grid.
    await expect(newWindow.appPO.workbench).toEqualWorkbenchLayout({
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
    await expect(newWindow.appPO.workbench).toEqualWorkbenchLayout({
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
