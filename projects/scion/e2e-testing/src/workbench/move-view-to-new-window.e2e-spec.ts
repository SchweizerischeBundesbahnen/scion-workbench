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
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {getPerspectiveId} from '../helper/testing.util';
import {expectView} from '../matcher/view-matcher';

test.describe('Workbench View', () => {

  test('should allow moving a path-based view in the workbench grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Define perspective with a view in the workbench grid.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addView('view.101', {partId: 'left', activateView: true});
    await layoutPage.addView('view.102', {partId: 'left', activateView: true});
    await layoutPage.navigateView('view.101', ['test-view']);
    await layoutPage.navigateView('view.102', ['test-view']);

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'view.101'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: 'view.1'});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({id: 'left', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
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

  test('should allow moving a empty-path view in the workbench grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Define perspective with a view in the workbench grid.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left', ratio: .25});
    await layoutPage.addView('view.101', {partId: 'left', activateView: true});
    await layoutPage.addView('view.102', {partId: 'left', activateView: true});
    await layoutPage.navigateView('view.101', [], {outlet: 'test-view'});
    await layoutPage.navigateView('view.102', [], {outlet: 'test-view'});

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'view.101'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: 'view.1'});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({id: 'left', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
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

  test('should allow moving a path-based view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'view.100'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: 'view.1'});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [
            {id: await routerPage.view.getViewId()},
          ],
          activeViewId: await routerPage.view.getViewId(),
        }),
      },
    });
  });

  test('should allow moving a empty-path view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const testViewPage = appPO.view({cssClass: 'testee'});

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newAppPO, {viewId: 'view.1'});
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

    // Register perspective.
    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'part'},
      ],
      views: [
        {id: 'view.1', partId: 'part'},
        {id: 'view.2', partId: 'part'},
        {id: 'view.3', partId: 'part', activateView: true},
      ],
      navigateViews: [
        {id: 'view.1', commands: ['test-view']}, // path-based view
        {id: 'view.2', commands: ['test-view']}, // path-based view
        {id: 'view.3', commands: [''], outlet: 'test-view'}, // empty-path view
      ],
    });
    await appPO.switchPerspective('perspective');

    // Move view 1 to a new window
    const newAppPO = await appPO.view({viewId: 'view.1'}).tab.moveToNewWindow();
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
        root: new MPart({
          views: [
            {id: 'view.2'},
            {id: 'view.3'},
          ],
          activeViewId: 'view.3',
        }),
      },
    });

    // Move view 2 to the new window
    await appPO.view({viewId: 'view.2'}).tab.moveTo(await newAppPO.activePart({inMainArea: true}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchId(),
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
        root: new MPart({
          views: [
            {id: 'view.3'},
          ],
          activeViewId: 'view.3',
        }),
      },
    });

    // Move view 3 (empty-path view) to the new window
    await appPO.view({viewId: 'view.3'}).tab.moveTo(await newAppPO.activePart({inMainArea: true}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchId(),
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
            {id: 'view.3'},
          ],
          activeViewId: 'view.3',
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
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
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
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
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
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
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
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
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
          views: [{id: 'view.1'}],
          activeViewId: 'view.1',
        }),
      },
    });
  });
});
