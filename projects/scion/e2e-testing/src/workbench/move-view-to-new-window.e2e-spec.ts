/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
import {WorkbenchNavigator} from './workbench-navigator';
import {getPerspectiveId} from '../helper/testing.util';
import {expectView} from '../matcher/view-matcher';
import {canMatchWorkbenchView} from './page-object/layout-page/register-route-page.po';

test.describe('Workbench View', () => {

  test('should move a path-based view in the main grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add two views to the main grid.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main', activateView: true, cssClass: 'testee'})
      .addView('view.102', {partId: 'part.main', activateView: true})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view']),
    );

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'view.101'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    const newViewId = await newAppPO.view({cssClass: 'testee'}).getViewId();
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO.view({viewId: newViewId}));
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: 'part.main', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
        },
      },
    });
  });

  test('should move an empty-path view in the main grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register test routes.
    await workbenchNavigator.registerRoute({
      path: '',
      component: 'view-page',
      canMatch: [canMatchWorkbenchView('test-view')],
    });

    // Define perspective with a view in the main grid.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main', cssClass: 'testee'})
      .addView('view.102', {partId: 'part.main', activateView: true})
      .navigateView('view.101', [], {hint: 'test-view'})
      .navigateView('view.102', [], {hint: 'test-view'}),
    );

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'view.101'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    const newViewId = await newAppPO.view({cssClass: 'testee'}).getViewId();
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO.view({viewId: newViewId}));
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: 'part.main', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
        },
      },
    });
  });

  test('should move a path-based view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.100',
      cssClass: 'testee',
    });

    // Move test view to new window.
    const newAppPO = await appPO.view({viewId: 'view.100'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    const newViewId = await newAppPO.view({cssClass: 'testee'}).getViewId();
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO.view({viewId: newViewId}));
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [
              {id: await routerPage.view.getViewId()},
            ],
            activeViewId: await routerPage.view.getViewId(),
          }),
        },
      },
    });
  });

  test('should move an empty-path view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee',
    });

    const testViewPage = appPO.view({cssClass: 'testee'});

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();
    const newViewId = await newAppPO.view({cssClass: 'testee'}).getViewId();

    // Expect test view to be moved to the new window.
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newAppPO.view({viewId: newViewId}));
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: await routerPage.view.getViewId()}],
            activeViewId: await routerPage.view.getViewId(),
          }),
        },
      },
    });
  });

  test('should move a view to another window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register test routes.
    await workbenchNavigator.registerRoute({
      path: '',
      component: 'view-page',
      canMatch: [canMatchWorkbenchView('test-view')],
    });

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.part')
      .addView('view.101', {partId: 'part.part', cssClass: 'testee-1'})
      .addView('view.102', {partId: 'part.part', cssClass: 'testee-2'})
      .addView('view.103', {partId: 'part.part', cssClass: 'testee-3'})
      .navigateView('view.101', ['test-view']) // path-based view
      .navigateView('view.102', ['test-view']) // path-based view
      .navigateView('view.103', [], {hint: 'test-view'}), // empty-path view
    );

    // Move view 1 to a new window
    const newAppPO = await appPO.view({viewId: 'view.101'}).tab.moveToNewWindow();
    const newView1Id = await newAppPO.view({cssClass: 'testee-1'}).getViewId();

    // Expect view 1 to be moved to the new window.
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [
              {id: newView1Id},
            ],
            activeViewId: newView1Id,
          }),
        },
      },
    });
    // Expect view 1 to be removed from the original window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            views: [
              {id: 'view.102'},
              {id: 'view.103'},
            ],
            activeViewId: 'view.102',
          }),
        },
      },
    });

    // Move view 2 to the new window
    await appPO.view({viewId: 'view.102'}).tab.moveTo(await newAppPO.activePart({grid: 'mainArea'}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchId(),
    });
    const newView2Id = await newAppPO.view({cssClass: 'testee-2'}).getViewId();

    // Expect view 2 to be moved to the new window.
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [
              {id: newView1Id},
              {id: newView2Id},
            ],
            activeViewId: newView2Id,
          }),
        },
      },
    });
    // Expect view 2 to be removed from the original window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            views: [
              {id: 'view.103'},
            ],
            activeViewId: 'view.103',
          }),
        },
      },
    });

    // Move view 3 (empty-path view) to the new window
    await appPO.view({viewId: 'view.103'}).tab.moveTo(await newAppPO.activePart({grid: 'mainArea'}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchId(),
    });
    const newView3Id = await newAppPO.view({cssClass: 'testee-3'}).getViewId();

    // Expect view 3 to be moved to the new window.
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [
              {id: newView1Id},
              {id: newView2Id},
              {id: newView3Id},
            ],
            activeViewId: newView3Id,
          }),
        },
      },
    });
    // Expect view 3 to be removed from the original window.
    await expect(appPO.views()).toHaveCount(0);
  });

  test('should memoize layout of anonymous perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      cssClass: 'test-view',
    });

    const testViewPage = appPO.view({cssClass: 'test-view'});

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();
    const newViewId = await newAppPO.view({cssClass: 'test-view'}).getViewId();
    const newWindow = {
      appPO: newAppPO,
      page: newAppPO.page,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view in the new browser window.
    const newAppRouterPage = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPage.navigate(['test-view'], {
      target: 'view.101',
    });
    await newAppRouterPage.view.tab.close();

    // Move peripheral view to main grid.
    const dragHandle = await newWindow.appPO.view({viewId: 'view.101'}).tab.startDrag();
    await dragHandle.dragToGrid({grid: 'main', region: 'east'});
    await dragHandle.drop();

    // Expect peripheral view to be dragged to the main grid.
    await expect(newWindow.appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MPart({id: MAIN_AREA}),
            child2: new MPart({
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
          }),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });

    // Capture name of anonymous perspective.
    const anonymousPerspectiveName = await getPerspectiveId(newWindow.page);

    // Switch to the new perspective.
    await newWindow.workbenchNavigator.createPerspective(factory => factory.addPart(MAIN_AREA));

    // Expect the layout to be blank.
    await expect(newWindow.appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });

    // Switch back to the anonymous perspective.
    await newWindow.appPO.switchPerspective(anonymousPerspectiveName);

    // Expect the layout of the anonymous perspective to be restored.
    await expect(newWindow.appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MPart({id: MAIN_AREA}),
            child2: new MPart({
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
          }),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });
  });

  test('should not store layout of anonymous perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      cssClass: 'test-view',
    });

    const testViewPage = appPO.view({cssClass: 'test-view'});

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();
    const newViewId = await newAppPO.view({cssClass: 'test-view'}).getViewId();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view.
    const newAppRouterPage = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPage.navigate(['test-view'], {
      target: 'view.101',
    });
    await newAppRouterPage.view.tab.close();

    // Move peripheral view to main grid.
    const dragHandle = await newWindow.appPO.view({viewId: 'view.101'}).tab.startDrag();
    await dragHandle.dragToGrid({grid: 'main', region: 'east'});
    await dragHandle.drop();

    // Expect peripheral view to be dragged to the main grid.
    await expect(newWindow.appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MPart({id: MAIN_AREA}),
            child2: new MPart({
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
          }),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });

    // Reload the new browser window.
    await newWindow.appPO.reload();

    // Expect the layout of the main grid not to be restored.
    await expect(newWindow.appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: newViewId}],
            activeViewId: newViewId,
          }),
        },
      },
    });
  });
});
