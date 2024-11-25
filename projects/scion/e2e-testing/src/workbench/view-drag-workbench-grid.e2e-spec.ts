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

test.describe('View Drag Workbench Grid', () => {

  test.describe('should allow dragging a view to the side of the workbench grid', () => {

    /**
     * +--------------------+    +----------+------------+
     * |    MAIN-AREA       | => |   WEST   | MAIN-AREA  |
     * | [view.1, view.101] |    | [view.1] | [view.101] |
     * +--------------------+    +----------+------------+
     */
    test('should allow dragging a view to the west in the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.101', {partId: initialPartId}),
      );

      // Move test view to the west of the workbench grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'west'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the west of the workbench grid.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
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
        mainAreaGrid: {
          root: new MPart({
            id: initialPartId,
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
          activePartId: initialPartId,
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
    test('should allow dragging a view to the west in the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('left-top', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
        .addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'left-top', activateView: true})
        .addView('view.103', {partId: 'left-bottom', activateView: true}),
      );

      // Move test view to the west of the workbench grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'west'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the west of the workbench grid.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
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
                  id: 'left-top',
                  views: [{id: 'view.102'}],
                  activeViewId: 'view.102',
                }),
                child2: new MPart({
                  id: 'left-bottom',
                  views: [{id: 'view.103'}],
                  activeViewId: 'view.103',
                }),
              }),
              child2: new MPart({id: MAIN_AREA}),
            }),
          }),
        },
        mainAreaGrid: {
          root: new MPart({
            id: initialPartId,
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
          activePartId: initialPartId,
        },
      });
    });

    /**
     * +--------------------+    +------------+----------+
     * |    MAIN-AREA       | => | MAIN-AREA  |   EAST   |
     * | [view.1, view.101] |    | [view.101] | [view.1] |
     * +--------------------+    +------------+----------+
     */
    test('should allow dragging a view to the east in the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.101', {partId: initialPartId}),
      );

      // Move test view to the east of the workbench grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'east'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the east of the workbench grid.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
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
        mainAreaGrid: {
          root: new MPart({
            id: initialPartId,
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
          activePartId: initialPartId,
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
    test('should allow dragging a view to the east in the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right', ratio: .25})
        .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'right-top', activateView: true})
        .addView('view.103', {partId: 'right-bottom', activateView: true}),
      );

      // Move test view to the east of the workbench grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'east'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the east of the workbench grid.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
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
                  id: 'right-top',
                  views: [{id: 'view.102'}],
                  activeViewId: 'view.102',
                }),
                child2: new MPart({
                  id: 'right-bottom',
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
        mainAreaGrid: {
          root: new MPart({
            id: initialPartId,
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
          activePartId: initialPartId,
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
    test('should allow dragging a view to the south in the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.101', {partId: initialPartId}),
      );

      // Move test view to the south of the workbench grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'south'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the south of the workbench grid.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
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
        mainAreaGrid: {
          root: new MPart({
            id: initialPartId,
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
          activePartId: initialPartId,
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
    test('should allow dragging a view to the south in the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom-left', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25})
        .addPart('bottom-right', {relativeTo: 'bottom-left', align: 'right', ratio: .6})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-left', activateView: true})
        .addView('view.103', {partId: 'bottom-right', activateView: true}),
      );

      // Move test view to the south of the workbench grid.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'south'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the south of the workbench grid.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
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
                  id: 'bottom-left',
                  views: [{id: 'view.102'}],
                  activeViewId: 'view.102',
                }),
                child2: new MPart({
                  id: 'bottom-right',
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
        mainAreaGrid: {
          root: new MPart({
            id: initialPartId,
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
          activePartId: initialPartId,
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: MAIN_AREA, align: 'right'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (3)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('bottom-left', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-left', activateView: true})
        .addView('view.103', {partId: 'right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (4)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('bottom-right', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-right', activateView: true})
        .addView('view.103', {partId: 'left', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (5)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('bottom-right', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-right', activateView: true})
        .addView('view.103', {partId: 'left', activateView: true})
        .addView('view.104', {partId: 'bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (6)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('middle', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'middle', activateView: true})
        .addView('view.103', {partId: 'left', activateView: true})
        .addView('view.104', {partId: 'bottom', activateView: true})
        .addView('view.105', {partId: 'right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (7)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('right', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('bottom-middle', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-middle', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (8)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('left-top', {relativeTo: MAIN_AREA, align: 'left'})
        .addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'})
        .addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'})
        .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'right-bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
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
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (9)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addPart('right', {relativeTo: MAIN_AREA, align: 'right'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToGrid('workbench', {region: 'center'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
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
    test('should disable drop zone when dragging a view into the tabbar', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPart = appPO.part({partId: 'bottom'});
      const bottomTabbarBounds = fromRect(await bottomPart.bar.getBoundingBox());

      // Drag tab to the center of the tabbar of the 'bottom' part.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragTo({x: bottomTabbarBounds.hcenter, y: bottomTabbarBounds.vcenter});

      // Drag tab to the beginning of the tabbar.
      await dragHandle.dragTo({x: 0, y: bottomTabbarBounds.vcenter});

      // Expect the drop zone to be inactive.
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(false);
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
    test('should not disable drop zone when entering tabbar while dragging a view over the drop zone', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPart = appPO.part({partId: 'bottom'});
      const bottomTabbarBounds = fromRect(await bottomPart.bar.getBoundingBox());

      // Drag tab into drop zone.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragTo({x: 0, y: 0});

      // Drag tab along the drop zone into the tabbar of the 'bottom' part.
      await dragHandle.dragTo({x: 0, y: bottomTabbarBounds.vcenter});

      // Expect the drop zone to be active.
      await expect.poll(() => appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
    });
  });
});
