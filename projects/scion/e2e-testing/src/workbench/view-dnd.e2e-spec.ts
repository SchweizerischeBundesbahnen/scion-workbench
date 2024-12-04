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
import {ViewPagePO} from './page-object/view-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {expectView} from '../matcher/view-matcher';
import {MAIN_AREA} from '../workbench.model';

test.describe('View Drag & Drop', () => {

  test.describe('view (de-)activation on drag', () => {
    test('should deactivate view when moving it quickly to the center', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the center quickly
      const partId = await appPO.activePart({inMainArea: true}).getPartId();
      const dragHandle = await viewPage2.view.tab.startDrag();
      await dragHandle.dragToPart(partId, {region: 'center', steps: 1});

      // Expect view 1 to be activated
      await expectView(viewPage1).toBeActive();
      await expect.poll(() => viewPage1.view.part.getPartId()).toEqual(partId);

      // Expect view 2 not to be attached
      await expect(viewPage2.view.locator).not.toBeAttached();
      await expect(viewPage2.view.tab.locator).not.toBeVisible();
      await expect.poll(() => viewPage2.view.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the north', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the north quickly
      const partId = await appPO.activePart({inMainArea: true}).getPartId();
      const dragHandle = await viewPage2.view.tab.startDrag();
      await dragHandle.dragToPart(partId, {region: 'north', steps: 1});

      // Expect view 1 to be activated
      await expectView(viewPage1).toBeActive();
      await expect.poll(() => viewPage1.view.part.getPartId()).toEqual(partId);

      // Expect view 2 not to be attached
      await expect(viewPage2.view.locator).not.toBeAttached();
      await expect(viewPage2.view.tab.locator).not.toBeVisible();
      await expect.poll(() => viewPage2.view.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the east', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the east quickly
      const partId = await appPO.activePart({inMainArea: true}).getPartId();
      const dragHandle = await viewPage2.view.tab.startDrag();
      await dragHandle.dragToPart(partId, {region: 'east', steps: 1});

      // Expect view 1 to be activated
      await expectView(viewPage1).toBeActive();
      await expect.poll(() => viewPage1.view.part.getPartId()).toEqual(partId);

      // Expect view 2 not to be attached
      await expect(viewPage2.view.locator).not.toBeAttached();
      await expect(viewPage2.view.tab.locator).not.toBeVisible();
      await expect.poll(() => viewPage2.view.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the south', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the south quickly
      const partId = await appPO.activePart({inMainArea: true}).getPartId();
      const dragHandle = await viewPage2.view.tab.startDrag();
      await dragHandle.dragToPart(partId, {region: 'south', steps: 1});

      // Expect view 1 to be activated
      await expectView(viewPage1).toBeActive();
      await expect.poll(() => viewPage1.view.part.getPartId()).toEqual(partId);

      // Expect view 2 not to be attached
      await expect(viewPage2.view.locator).not.toBeAttached();
      await expect(viewPage2.view.tab.locator).not.toBeVisible();
      await expect.poll(() => viewPage2.view.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the west', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the west quickly
      const partId = await appPO.activePart({inMainArea: true}).getPartId();
      const dragHandle = await viewPage2.view.tab.startDrag();
      await dragHandle.dragToPart(partId, {region: 'west', steps: 1});

      // Expect view 1 to be activated
      await expectView(viewPage1).toBeActive();
      await expect.poll(() => viewPage1.view.part.getPartId()).toEqual(partId);

      // Expect view 2 not to be attached
      await expect(viewPage2.view.locator).not.toBeAttached();
      await expect(viewPage2.view.tab.locator).not.toBeVisible();
      await expect.poll(() => viewPage2.view.part.getPartId()).toEqual(partId);
    });
  });

  test.describe('drag to own part', () => {

    /**
     * +-----------------+    +-----------------+
     * |     INITIAL     | => |     INITIAL     |
     * | [view.1,view.2] |    | [view.1,view.2] |
     * +-----------------+    +-----------------+
     */
    test('should allow dragging a view to the center of its own part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two views in the main area.
      const view1 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;

      // Move view 2 to the center.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'center'});
      await dragHandle.drop();

      // Expect view 2 not to be moved.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MPart({
            id: await view1.part.getPartId(),
            views: [{id: 'view.1'}, {id: 'view.2'}],
            activeViewId: 'view.2',
          }),
          activePartId: await view1.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+    +----------+----------+
     * |     INITIAL     | => |  WEST    |  INITIAL |
     * | [view.1,view.2] |    | [view.2] | [view.1] |
     * +-----------------+    +----------+----------+
     */
    test('should allow dragging a view to a new part in the west of its own part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two views in the main area.
      const view1 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;

      // Move view 2 to a new part in the west.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'west'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the west.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: await view2.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MPart({
              id: await view1.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
          }),
          activePartId: await view2.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+    +----------+----------+
     * |     INITIAL     | => |  INITIAL |  EAST    |
     * | [view.1,view.2] |    | [view.1] | [view.2] |
     * +-----------------+    +----------+----------+
     */
    test('should allow dragging a view to a new part in the east of its own part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two views in the main area.
      const view1 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;

      // Move view 2 to a new part in the east.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the east.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: await view1.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
            child2: new MPart({
              id: await view2.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
          activePartId: await view2.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+    +----------+
     * |                 |    |  NORTH   |
     * |      INITIAL    |    | [view.2] |
     * | [view.1,view.2] | => +----------+
     * |                 |    |  INITIAL |
     * |                 |    | [view.1] |
     * +-----------------+    +----------+
     */
    test('should allow dragging a view to a new part in the north of its own part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two views in the main area.
      const view1 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;

      // Move view 2 to a new part in the north.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'north'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the north.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: await view2.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MPart({
              id: await view1.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
          }),
          activePartId: await view2.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+    +----------+
     * |                 |    |  INITIAL |
     * |      INITIAL    |    | [view.1] |
     * | [view.1,view.2] | => +----------+
     * |                 |    |  SOUTH   |
     * |                 |    | [view.2] |
     * +-----------------+    +----------+
     */
    test('should allow dragging a view to a new part in the south of its own part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two views in the main area.
      const view1 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;

      // Move view 2 to a new part in the south.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'south'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the south.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: await view1.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
            child2: new MPart({
              id: await view2.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
          activePartId: await view2.part.getPartId(),
        },
      });
    });
  });

  test.describe('drag to another part', () => {

    /**
     * +-----------+----------------------+    +--------------------+------------+
     * |  INITIAL  |       RIGHT          | => |      INITIAL       |   RIGHT    |
     * | [view.1]  | [view.101, view.102] |    | [view.1, view.101] | [view.102] |
     * +-----------+----------------------+    +--------------------+------------+
     */
    test('should allow dragging a view to the center of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const initialPartView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await initialPartView.view.part.getPartId();

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right', ratio: .5})
        .addView('view.101', {partId: 'right', activateView: true})
        .addView('view.102', {partId: 'right'}),
      );

      // Move view to the center of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart(initialPartId, {region: 'center'});
      await dragHandle.drop();

      // Expect view to be moved to the initial part.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: initialPartId,
              views: [{id: 'view.1'}, {id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            child2: new MPart({
              id: 'right',
              views: [{id: 'view.102'}],
              activeViewId: 'view.102',
            }),
          }),
          activePartId: initialPartId,
        },
      });
    });

    /**
     * +-----------+----------------------+    +------------+------------+------------+
     * |  INITIAL  |       RIGHT          | => |    WEST    |   INITIAL  |   RIGHT    |
     * | [view.1]  | [view.101, view.102] |    | [view.101] | [view.1]   | [view.102] |
     * +-----------+----------------------+    +------------+------------+------------+
     */
    test('should allow dragging a view to the west of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const initialPartView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await initialPartView.view.part.getPartId();

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right', ratio: .5})
        .addView('view.101', {partId: 'right', activateView: true})
        .addView('view.102', {partId: 'right'}),
      );

      // Move view to a new part in the west of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart(initialPartId, {region: 'west'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the west of the initial part.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: testViewInfo.partId,
                views: [{id: 'view.101'}],
                activeViewId: 'view.101',
              }),
              child2: new MPart({
                id: initialPartId,
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
            }),
            child2: new MPart({
              id: 'right',
              views: [{id: 'view.102'}],
              activeViewId: 'view.102',
            }),
          }),
          activePartId: testViewInfo.partId,
        },
      });
    });

    /**
     * +----------+----------------------+    +----------+------------+------------+
     * |  INITIAL |       RIGHT          | => |  INITIAL |  EAST      |   RIGHT    |
     * | [view.1] | [view.101, view.102] |    | [view.1] | [view.101] | [view.102] |
     * +----------+----------------------+    +----------+------------+------------+
     */
    test('should allow dragging a view to the east of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const initialPartView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await initialPartView.view.part.getPartId();

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right', ratio: .5})
        .addView('view.101', {partId: 'right', activateView: true})
        .addView('view.102', {partId: 'right'}),
      );

      // Move view to a new part in the east of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart(initialPartId, {region: 'east'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the east of the initial part.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: initialPartId,
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: 'view.101'}],
                activeViewId: 'view.101',
              }),
            }),
            child2: new MPart({
              id: 'right',
              views: [{id: 'view.102'}],
              activeViewId: 'view.102',
            }),
          }),
          activePartId: testViewInfo.partId,
        },
      });
    });

    /**
     * +----------+----------------------+    +------------+------------+
     * |          |                      |    |  NORTH     |            |
     * | INITIAL  |       RIGHT          |    | [view.101] |   RIGHT    |
     * | [view.1] | [view.101, view.102] | => +------------+ [view.102] |
     * |          |                      |    | INITIAL    |            |
     * |          |                      |    | [view.1]   |            |
     * +----------+----------------------+    +------------+------------+
     */
    test('should allow dragging a view to the north of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const initialPartView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await initialPartView.view.part.getPartId();

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right', ratio: .5})
        .addView('view.101', {partId: 'right', activateView: true})
        .addView('view.102', {partId: 'right'}),
      );

      // Move view to a new part in the north of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart(initialPartId, {region: 'north'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the north of the initial part.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: testViewInfo.partId,
                views: [{id: 'view.101'}],
                activeViewId: 'view.101',
              }),
              child2: new MPart({
                id: initialPartId,
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
            }),
            child2: new MPart({
              id: 'right',
              views: [{id: 'view.102'}],
              activeViewId: 'view.102',
            }),
          }),
          activePartId: testViewInfo.partId,
        },
      });
    });

    /**
     * +----------+----------------------+    +------------+------------+
     * |          |                      |    |  INITIAL   |            |
     * | INITIAL  |       RIGHT          |    | [view.1]   |   RIGHT    |
     * | [view.1] | [view.101, view.102] | => +------------+ [view.102] |
     * |          |                      |    |  SOUTH     |            |
     * |          |                      |    | [view.101] |            |
     * +----------+----------------------+    +------------+------------+
     */
    test('should allow dragging a view to the south of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const initialPartView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await initialPartView.view.part.getPartId();

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right', ratio: .5})
        .addView('view.101', {partId: 'right', activateView: true})
        .addView('view.102', {partId: 'right'}),
      );

      // Move view to a new part in the south of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart(initialPartId, {region: 'south'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the south of the initial part.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: initialPartId,
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: 'view.101'}],
                activeViewId: 'view.101',
              }),
            }),
            child2: new MPart({
              id: 'right',
              views: [{id: 'view.102'}],
              activeViewId: 'view.102',
            }),
          }),
          activePartId: testViewInfo.partId,
        },
      });
    });
  });

  test.describe('drag to start page', () => {

    test('should drop view on start page of the main area (grid root is MPart)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('left', {align: 'left'})
        .addView('testee', {partId: 'left', cssClass: 'testee'})
        .navigateView('testee', ['test-view']),
      );

      // Drop view on the start page of the main area.
      const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      const dragHandle = await testeeViewPage.view.tab.startDrag();
      await dragHandle.dragToGrid('mainArea', {region: 'center'});
      await dragHandle.drop();

      // Expect view to be moved to the main area.
      await expectView(testeeViewPage).toBeActive();
      await expect.poll(() => testeeViewPage.view.part.isInMainArea()).toBe(true);
    });

    test('should drop view on start page of the main area (grid root is MTreeNode)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('left', {align: 'left'})
        .addView('testee', {partId: 'left', cssClass: 'testee'})
        .navigateView('testee', ['test-view']),
      );

      // Change the grid root of the main area to a `MTreeNode`.
      await workbenchNavigator.modifyLayout((layout, activePartId) => layout
        .addPart('main-left', {relativeTo: activePartId, align: 'left'})
        .addPart('main-right', {relativeTo: activePartId, align: 'right'}),
      );

      // Drop view on the start page of the main area.
      const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      const dragHandle = await testeeViewPage.view.tab.startDrag();
      await dragHandle.dragToGrid('mainArea', {region: 'center'});
      await dragHandle.drop();

      // Expect view to be moved to the main area.
      await expectView(testeeViewPage).toBeActive();
      await expect.poll(() => testeeViewPage.view.part.isInMainArea()).toBe(true);
    });
  });

  test.describe('drag image', () => {

    test('should render drag image', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await viewPage.enterTitle('Title');

      // Start dragging the view.
      const dragHandle = await viewPage.view.tab.startDrag();
      await dragHandle.dragToPart(await viewPage.view.part.getPartId(), {region: 'center'});

      // Expect drag image to have title.
      await expect(page.locator('wb-view-tab-drag-image').locator('span.e2e-title')).toHaveText('Title');
      await expect(page.locator('wb-view-tab-drag-image').locator('span.e2e-heading')).toBeHidden();
    });

    test('should render multi-line drag image', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await viewPage.enterTitle('Title');
      await viewPage.enterHeading('Heading');

      // Start dragging the view.
      const dragHandle = await viewPage.view.tab.startDrag();
      await dragHandle.dragToPart(await viewPage.view.part.getPartId(), {region: 'center'});

      // Expect drag image to have title and heading.
      await expect(page.locator('wb-view-tab-drag-image').locator('span.e2e-title')).toHaveText('Title');
      await expect(page.locator('wb-view-tab-drag-image').locator('span.e2e-heading')).toHaveText('Heading');
    });

    test('should render tab content when dragging the tab quickly into the window', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await viewPage.enterTitle('Title');

      // Move view tab out of the window.
      const dragHandle = await viewPage.view.tab.startDrag();
      await dragHandle.dragTo({deltaX: -500, deltaY: 0});

      // Move view tab quickly into the window.
      await dragHandle.dragTo({deltaX: 500, deltaY: 0}, {steps: 1});

      // Expect view tab to render content.
      await expect(page.locator('wb-view-tab-drag-image').locator('span.e2e-title')).toHaveText('Title');
    });
  });
});
