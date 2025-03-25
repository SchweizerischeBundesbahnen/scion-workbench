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
import {fromRect} from '../helper/testing.util';
import {MAIN_AREA} from '../workbench.model';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('View Drag Main Grid', () => {

  test.describe('should allow dragging a view to the side of the main grid', () => {

    /**
     * +--------------------+    +----------+------------+
     * |    MAIN-AREA       | => |   WEST   | MAIN-AREA  |
     * | [view.1, view.101] |    | [view.1] | [view.101] |
     * +--------------------+    +----------+------------+
     */
    test('should allow dragging a view to the west in the main grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.101', {partId: 'part.initial'}),
      );

      // Move test view to the west of the main grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid({grid: 'main', region: 'west'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the west of the main grid.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .2,
              child1: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
              child2: new MPart({id: MAIN_AREA}),
            }),
          },
          mainArea: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            activePartId: 'part.initial',
          },
        },
      });
    });

    /**
     * +---------------+------------------+    +----------+---------------+------------+
     * |  LEFT-TOP     |                  |    |          | LEFT-TOP      |            |
     * |  [view.102]   |                  |    |          | [view.102]    |            |
     * +---------------+    MAIN-AREA     | => |   WEST   +---------------+  MAIN-AREA |
     * | LEFT-BOTTOM   |[view.1, view.101]|    | [view.1] | LEFT-BOTTOM   | [view.101] |
     * |  [view.103]   |                  |    |          |  [view.103]   |            |
     * +---------------+------------------+    +----------+---------------+------------+
     */
    test('should allow dragging a view to the west in the main grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left-top', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
        .addPart('part.left-bottom', {relativeTo: 'part.left-top', align: 'bottom', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.left-top', activateView: true})
        .addView('view.103', {partId: 'part.left-bottom', activateView: true}),
      );

      // Move test view to the west of the main grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid({grid: 'main', region: 'west'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the west of the main grid.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .2,
              child1: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
              child2: new MTreeNode({
                direction: 'row',
                ratio: .25,
                child1: new MTreeNode({
                  direction: 'column',
                  ratio: .75,
                  child1: new MPart({
                    id: 'part.left-top',
                    views: [{id: 'view.102'}],
                    activeViewId: 'view.102',
                  }),
                  child2: new MPart({
                    id: 'part.left-bottom',
                    views: [{id: 'view.103'}],
                    activeViewId: 'view.103',
                  }),
                }),
                child2: new MPart({id: MAIN_AREA}),
              }),
            }),
          },
          mainArea: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            activePartId: 'part.initial',
          },
        },
      });
    });

    /**
     * +--------------------+    +------------+----------+
     * |    MAIN-AREA       | => | MAIN-AREA  |   EAST   |
     * | [view.1, view.101] |    | [view.101] | [view.1] |
     * +--------------------+    +------------+----------+
     */
    test('should allow dragging a view to the east in the main grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.101', {partId: 'part.initial'}),
      );

      // Move test view to the east of the main grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid({grid: 'main', region: 'east'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the east of the main grid.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .8,
              child1: new MPart({id: MAIN_AREA}),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
            }),
          },
          mainArea: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            activePartId: 'part.initial',
          },
        },
      });
    });

    /**
     * +------------------+--------------+    +-------------+--------------+----------+
     * |                  |  RIGHT-TOP   |    |             |  RIGHT-TOP   |          |
     * |                  |  [view.102]  |    |             |  [view.102]  |          |
     * |    MAIN-AREA     +--------------+ => | MAIN-AREA   +--------------+   EAST   +
     * |[view.1, view.101]| RIGHT-BOTTOM |    | [view.101]  | RIGHT-BOTTOM | [view.1] |
     * |                  |  [view.103]  |    |             |  [view.103]  |          |
     * +------------------+--------------+    +-------------+--------------+----------+
     */
    test('should allow dragging a view to the east in the main grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.right-top', {relativeTo: MAIN_AREA, align: 'right', ratio: .25})
        .addPart('part.right-bottom', {relativeTo: 'part.right-top', align: 'bottom', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.right-top', activateView: true})
        .addView('view.103', {partId: 'part.right-bottom', activateView: true}),
      );

      // Move test view to the east of the main grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid({grid: 'main', region: 'east'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the east of the main grid.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .8,
              child1: new MTreeNode({
                direction: 'row',
                ratio: .75,
                child1: new MPart({id: MAIN_AREA}),
                child2: new MTreeNode({
                  direction: 'column',
                  ratio: .75,
                  child1: new MPart({
                    id: 'part.right-top',
                    views: [{id: 'view.102'}],
                    activeViewId: 'view.102',
                  }),
                  child2: new MPart({
                    id: 'part.right-bottom',
                    views: [{id: 'view.103'}],
                    activeViewId: 'view.103',
                  }),
                }),
              }),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
            }),
          },
          mainArea: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            activePartId: 'part.initial',
          },
        },
      });
    });

    /**
     * +--------------------+    +-------------+
     * |                    |    | MAIN-AREA   |
     * |    MAIN-AREA       |    | [view.101]  |
     * | [view.1, view.101] | => +-------------+
     * |                    |    |   SOUTH     |
     * |                    |    | [view.1]    |
     * +--------------------+    +-------------+
     */
    test('should allow dragging a view to the south in the main grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.101', {partId: 'part.initial'}),
      );

      // Move test view to the south of the main grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid({grid: 'main', region: 'south'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the south of the main grid.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'column',
              ratio: .8,
              child1: new MPart({id: MAIN_AREA}),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
            }),
          },
          mainArea: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            activePartId: 'part.initial',
          },
        },
      });
    });

    /**
     * +----------------------------+    +----------------------------+
     * |                            |    |         MAIN-AREA          |
     * |         MAIN-AREA          |    |          [view.101]        |
     * |     [view.1, view.101]     | => +-------------+--------------+
     * |                            |    | BOTTOM-LEFT | BOTTOM-RIGHT |
     * |                            |    |  [view.102] |   [view.103] |
     * +-------------+--------------+    +-------------+--------------+
     * | BOTTOM-LEFT | BOTTOM-RIGHT |    |           SOUTH            |
     * |  [view.102] |  [view.103]  |    |         [view.1]           |
     * +----------------------------+    +----------------------------+
     */
    test('should allow dragging a view to the south in the main grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.bottom-left', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25})
        .addPart('part.bottom-right', {relativeTo: 'part.bottom-left', align: 'right', ratio: .6})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-left', activateView: true})
        .addView('view.103', {partId: 'part.bottom-right', activateView: true}),
      );

      // Move test view to the south of the main grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid({grid: 'main', region: 'south'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the south of the main grid.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'column',
              ratio: .8,
              child1: new MTreeNode({
                direction: 'column',
                ratio: .75,
                child1: new MPart({id: MAIN_AREA}),
                child2: new MTreeNode({
                  direction: 'row',
                  ratio: .4,
                  child1: new MPart({
                    id: 'part.bottom-left',
                    views: [{id: 'view.102'}],
                    activeViewId: 'view.102',
                  }),
                  child2: new MPart({
                    id: 'part.bottom-right',
                    views: [{id: 'view.103'}],
                    activeViewId: 'view.103',
                  }),
                }),
              }),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
            }),
          },
          mainArea: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            activePartId: 'part.initial',
          },
        },
      });
    });

    /**
     * +-------------------+------------+
     * |                   |            |
     * |     MAIN-AREA     |  RIGHT     |
     * | [view.1,view.101] | [view.102] |
     * |                   |            |
     * +-------------------+------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.right', {relativeTo: MAIN_AREA, align: 'right'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(false);
    });

    /**
     * +-------------------+
     * |     MAIN-AREA     |
     * | [view.1,view.101] |
     * +-------------------|
     * |      BOTTOM       |
     * |     [view.102]    |
     * +-------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(true);
    });

    /**
     * +-------------------+------------+
     * |   MAIN-AREA       |            |
     * | [view.1,view.101] |  RIGHT     |
     * +-------------------| [view.103] |
     * |   BOTTOM-LEFT     |            |
     * |     [view.102]    |            |
     * +-------------------+------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (3)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.right', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('part.bottom-left', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-left', activateView: true})
        .addView('view.103', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(false);
    });

    /**
     * +------------+-------------------+
     * |            |   MAIN-AREA       |
     * |   LEFT     | [view.1,view.101] |
     * | [view.103] +-------------------|
     * |            |   BOTTOM-RIGHT    |
     * |            |     [view.102]    |
     * +------------+-------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (4)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('part.bottom-right', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-right', activateView: true})
        .addView('view.103', {partId: 'part.left', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(true);
    });

    /**
     * +------------+-------------------+
     * |            |    MAIN-AREA      |
     * |   LEFT     | [view.1,view.101] |
     * | [view.103] +-------------------|
     * |            |   BOTTOM-RIGHT    |
     * |            |     [view.102]    |
     * +------------+-------------------+
     * |             BOTTOM             |
     * |            [view.104]          |
     * +--------------------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (5)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addPart('part.left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('part.bottom-right', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-right', activateView: true})
        .addView('view.103', {partId: 'part.left', activateView: true})
        .addView('view.104', {partId: 'part.bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(true);
    });

    /**
     * +------------+-----------------+------------+
     * |            |   MAIN-AREA     |            |
     * |   LEFT     | [view.1,view.2] |            |
     * | [view.103] +-----------------|            |
     * |            |     MIDDLE      |   RIGHT    |
     * |            |    [view.102]   | [view.105] |
     * +------------+-----------------+            |
     * |             BOTTOM           |            |
     * |            [view.104]        |            |
     * +------------------------------+------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (6)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.right', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addPart('part.left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('part.middle', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.middle', activateView: true})
        .addView('view.103', {partId: 'part.left', activateView: true})
        .addView('view.104', {partId: 'part.bottom', activateView: true})
        .addView('view.105', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(false);
    });

    /**
     * +------------+-------------------+----------+
     * |            |   MAIN-AREA       |          |
     * |    LEFT    | [view.1,view.101] | RIGHT    |
     * | <no views> +-------------------|<no views>|
     * |            | BOTTOM-MIDDLE     |          |
     * |            |     [view.102]    |          |
     * +------------+-------------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (7)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('part.right', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('part.bottom-middle', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-middle', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(true);
    });

    /**
     * +-------------+-------------------+--------------+
     * |   LEFT-TOP  |                   |   RIGHT-TOP  |
     * |  <no views> |   MAIN-AREA       |   <no views> |
     * +-------------+ [view.1,view.101] +--------------+
     * | LEFT-BOTTOM |                   | RIGHT-BOTTOM |
     * | <no views>  |                   |  [view.102]  |
     * +-------------+-------------------+--------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (8)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left-top', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('part.right-top', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('part.left-bottom', {relativeTo: 'part.left-top', align: 'bottom'})
        .addPart('part.right-bottom', {relativeTo: 'part.right-top', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.right-bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(false);
    });

    /**
     * +--------------------+------------+
     * |    MAIN-AREA       |   RIGHT    |
     * | [view.1, view.101] | [view.102] |
     * +--------------------+------------+
     * |           BOTTOM                |
     * |         <no views>              |
     * +---------------------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main grid (9)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addPart('part.right', {relativeTo: MAIN_AREA, align: 'right'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'north'}, {orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'south'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'east'}, {orElse: false})).toBe(false);
    });

    /**
     * +--------------------+
     * |    MAIN-AREA       |
     * | [view.1, view.101] |
     * +--------------------+
     * |     BOTTOM         |
     * |    [view.102]      |
     * +--------------------+
     */
    test('should disable drop zone when dragging a view into the tabbar', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom', activateView: true}),
      );

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPart = appPO.part({partId: 'part.bottom'});
      const bottomTabbarBounds = fromRect(await bottomPart.bar.getBoundingBox());

      // Drag tab to the center of the tabbar of the 'bottom' part.
      const dragHandle = await testView.view.tab.startDrag();

      // Drag to the center of the bottom tabbar.
      await dragHandle.dragTo({x: bottomTabbarBounds.hcenter, y: bottomTabbarBounds.vcenter});

      // Expect the drop zone not to be active if dragging over the tabbar.
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {dragFromCenter: false, orElse: false})).toBe(false);

      // Drag near to the bottom tabbar.
      await dragHandle.dragTo({x: bottomTabbarBounds.hcenter, y: bottomTabbarBounds.vcenter - 100});

      // Expect the drop zone to be active if not dragging over the tabbar.
      await expect.poll(() => dragHandle.dragToGrid({grid: 'main', region: 'west'}, {dragFromCenter: false})).toBe(true);
    });

    /**
     * +--------------------+
     * |    MAIN-AREA       |
     * | [view.1, view.101] |
     * +--------------------+
     * |     BOTTOM         |
     * |    [view.102]      |
     * +--------------------+
     */
    test('should not disable drop zone when entering tabbar while dragging a view over the drop zone', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom', activateView: true}),
      );

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPart = appPO.part({partId: 'part.bottom'});
      const bottomTabbarBounds = fromRect(await bottomPart.bar.getBoundingBox());

      // Drag tab into drop zone.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragTo({x: 0, y: 0});

      // Drag tab along the drop zone into the tabbar of the 'bottom' part.
      await dragHandle.dragTo({x: 0, y: bottomTabbarBounds.vcenter});

      // Expect the drop zone to be active.
      await expect.poll(() => appPO.grid({grid: 'main'}).getActiveDropZone()).toEqual('west');
    });
  });
});
