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

test.describe('Workbench View', () => {

  test('should move a path-based view in the main grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add two views to the peripheral area.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addView('testee-1', {partId: 'part.left', activateView: true, cssClass: 'testee-1'})
      .addView('view.102', {partId: 'part.left', activateView: true})
      .navigateView('testee-1', ['test-view'])
      .navigateView('view.102', ['test-view']),
    );

    // Move test view to new window.
    const newAppPO = await appPO.view({cssClass: 'testee-1'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    const views = await newAppPO.workbench.views();
    const testeeView = views.find(view => view.alternativeId === 'testee-1')!;
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: testeeView.id}],
            activeViewId: testeeView.id,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: testeeView.id});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({id: 'part.left', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });
  });

  test('should move an empty-path view in the main grid to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Define perspective with a view in the main grid.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addView('testee-1', {partId: 'part.left', activateView: true, cssClass: 'testee-1'})
      .addView('view.102', {partId: 'part.left', activateView: true})
      .navigateView('testee-1', [], {hint: 'test-view'})
      .navigateView('view.102', [], {hint: 'test-view'}),
    );

    // Move test view to new window.
    const newAppPO = await appPO.view({cssClass: 'testee-1'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    const views = await newAppPO.workbench.views();
    const testeeView = views.find(view => view.alternativeId === 'testee-1')!;
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: testeeView.id}],
            activeViewId: testeeView.id,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: testeeView.id});
    await expectView(viewPage).toBeActive();

    // Expect test view to be removed from the origin window.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({id: 'part.left', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });
  });

  test('should move a path-based view in the main area to a new window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'testee',
      cssClass: 'testee',
    });

    // Move test view to new window.
    const newAppPO = await appPO.view({cssClass: 'testee'}).tab.moveToNewWindow();
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Expect test view to be moved to the new window.
    const views = await newAppPO.workbench.views();
    const testeeView = views.find(view => view.alternativeId === 'testee')!;
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: testeeView.id}],
            activeViewId: testeeView.id,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newWindow.appPO, {viewId: testeeView.id});
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
      target: 'testee',
      cssClass: 'testee',
    });

    const testViewPage = appPO.view({cssClass: 'testee'});

    // Move test view to new window.
    const newAppPO = await testViewPage.tab.moveToNewWindow();

    // Expect test view to be moved to the new window.
    const views = await newAppPO.workbench.views();
    const testeeView = views.find(view => view.alternativeId === 'testee')!;
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [{id: testeeView.id}],
            activeViewId: testeeView.id,
          }),
        },
      },
    });

    // Expect test view to display.
    const viewPage = new ViewPagePO(newAppPO, {viewId: testeeView.id});
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

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.part')
      .addView('testee-1', {partId: 'part.part', cssClass: 'testee-1'})
      .addView('testee-2', {partId: 'part.part', cssClass: 'testee-2'})
      .addView('testee-3', {partId: 'part.part', cssClass: 'testee-3'})
      .navigateView('testee-1', ['test-view']) // path-based view
      .navigateView('testee-2', ['test-view']) // path-based view
      .navigateView('testee-3', [], {hint: 'test-view'}), // empty-path view
    );

    const view1Id = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const view2Id = await appPO.view({cssClass: 'testee-2'}).getViewId();
    const view3Id = await appPO.view({cssClass: 'testee-3'}).getViewId();

    // Move view 1 to a new window
    const newAppPO = await appPO.view({viewId: view1Id}).tab.moveToNewWindow();

    // Expect view 1 to be moved to the new window.
    const view1InNewWindow = (await newAppPO.workbench.views()).find(view => view.alternativeId === 'testee-1')!;
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [
              {id: view1InNewWindow.id},
            ],
            activeViewId: view1InNewWindow.id,
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
              {id: view2Id},
              {id: view3Id},
            ],
            activeViewId: view2Id,
          }),
        },
      },
    });

    // Move view 2 to the new window
    await appPO.view({viewId: view2Id}).tab.moveTo(await newAppPO.activePart({grid: 'mainArea'}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchId(),
    });

    // Expect view 2 to be moved to the new window.
    const view2InNewWindow = (await newAppPO.workbench.views()).find(view => view.alternativeId === 'testee-2')!;
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [
              {id: view1InNewWindow.id},
              {id: view2InNewWindow.id},
            ],
            activeViewId: view2InNewWindow.id,
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
              {id: view3Id},
            ],
            activeViewId: view3Id,
          }),
        },
      },
    });

    // Move view 3 (empty-path view) to the new window
    await appPO.view({viewId: view3Id}).tab.moveTo(await newAppPO.activePart({grid: 'mainArea'}).getPartId(), {
      workbenchId: await newAppPO.getWorkbenchId(),
    });

    // Expect view 3 to be moved to the new window.
    const view3InNewWindow = (await newAppPO.workbench.views()).find(view => view.alternativeId === 'testee-3')!;
    await expect(newAppPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({
            views: [
              {id: view1InNewWindow.id},
              {id: view2InNewWindow.id},
              {id: view3InNewWindow.id},
            ],
            activeViewId: view3InNewWindow.id,
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
    const newWindow = {
      appPO: newAppPO,
      page: newAppPO.page,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view in the new browser window.
    const newAppRouterPage = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPage.navigate(['test-view'], {
      target: 'view.101',
      cssClass: 'peripheral-view',
    });
    await newAppRouterPage.view.tab.close();

    // Move peripheral view to main grid.
    const peripheralViewPage = newWindow.appPO.view({viewId: 'view.101'});
    const dragHandle = await peripheralViewPage.tab.startDrag();
    await dragHandle.dragToGrid({grid: 'main', region: 'east'});
    await dragHandle.drop();

    // Expect peripheral view to be dragged to the main grid.
    const testViewId = await newAppPO.view({cssClass: 'test-view'}).getViewId();
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
            views: [{id: testViewId}],
            activeViewId: testViewId,
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
            views: [{id: testViewId}],
            activeViewId: testViewId,
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
            views: [{id: testViewId}],
            activeViewId: testViewId,
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
    const newWindow = {
      appPO: newAppPO,
      workbenchNavigator: new WorkbenchNavigator(newAppPO),
    };

    // Open peripheral view.
    const newAppRouterPage = await newWindow.workbenchNavigator.openInNewTab(RouterPagePO);
    await newAppRouterPage.navigate(['test-view'], {
      target: 'view.101',
      cssClass: 'peripheral-view',
    });
    await newAppRouterPage.view.tab.close();

    // Move peripheral view to main grid.
    const peripheralViewPage = newWindow.appPO.view({cssClass: 'peripheral-view'});
    const dragHandle = await peripheralViewPage.tab.startDrag();
    await dragHandle.dragToGrid({grid: 'main', region: 'east'});
    await dragHandle.drop();

    // Expect peripheral view to be dragged to the main grid.
    const testViewId = await newAppPO.view({cssClass: 'test-view'}).getViewId();
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
            views: [{id: testViewId}],
            activeViewId: testViewId,
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
            views: [{id: testViewId}],
            activeViewId: testViewId,
          }),
        },
      },
    });
  });
});
