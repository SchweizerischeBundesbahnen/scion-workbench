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
import {LayoutPagePO} from './page-object/layout-page.po';
import {fromRect} from '../helper/testing.util';
import {MAIN_AREA} from '../workbench.model';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('View Drag Workbench Grid', () => {

  test.describe('should allow dragging a view to the side of the workbench grid', () => {

    /**
     * +------------------+    +----------+-----------+
     * |    MAIN-AREA     | => |   WEST   | MAIN-AREA |
     * | [view.1, view.2] |    | [view.2] | [view.1]  |
     * +------------------+    +----------+-----------+
     */
    test('should allow dragging a view to the west in the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to the west of the workbench grid.
      await view2PO.viewTab.dragTo({grid: 'workbench', region: 'west'});

      // Expect view 2 to be moved to the west of the workbench grid.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .2,
            child1: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
        mainAreaGrid: {
          root: new MPart({
            id: await view1PO.viewPO.part.getPartId(),
            views: [{id: 'view.1'}],
            activeViewId: 'view.1',
          }),
          activePartId: await view1PO.viewPO.part.getPartId(),
        },
      });
    });

    /**
     * +-------------+----------------+    +----------+-------------+------------+
     * |  LEFT-TOP   |                |    |          | LEFT-TOP    |            |
     * |  [view.3]   |                |    |          | [view.3]    |            |
     * +-------------+    MAIN-AREA   | => |   WEST   +-------------+  MAIN-AREA |
     * | LEFT-BOTTOM |[view.1, view.2]|    | [view.2] | LEFT-BOTTOM | [view.1]   |
     * |  [view.4]   |                |    |          |  [view.4]   |            |
     * +-------------+----------------+    +----------+-------------+------------+
     */
    test('should allow dragging a view to the west in the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('left-top', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});
      await view1PO.addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'left-top', activateView: true});
      await view1PO.addView('view.4', {partId: 'left-bottom', activateView: true});

      // Move view 2 to the west of the workbench grid.
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      await view2PO.viewTab.dragTo({grid: 'workbench', region: 'west'});

      // Expect view 2 to be moved to the west of the workbench grid.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .2,
            child1: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MTreeNode({
              direction: 'row',
              ratio: .25,
              child1: new MTreeNode({
                direction: 'column',
                ratio: .75,
                child1: new MPart({
                  id: 'left-top',
                  views: [{id: 'view.3'}],
                  activeViewId: 'view.3',
                }),
                child2: new MPart({
                  id: 'left-bottom',
                  views: [{id: 'view.4'}],
                  activeViewId: 'view.4',
                }),
              }),
              child2: new MPart({id: MAIN_AREA}),
            }),
          }),
        },
        mainAreaGrid: {
          root: new MPart({
            id: await view1PO.viewPO.part.getPartId(),
            views: [{id: 'view.1'}],
            activeViewId: 'view.1',
          }),
          activePartId: await view1PO.viewPO.part.getPartId(),
        },
      });
    });

    /**
     * +------------------+    +----------+-----------+
     * |    MAIN-AREA     | => |   WEST   | MAIN-AREA |
     * | [view.1, view.2] |    | [view.2] | [view.1]  |
     * +------------------+    +----------+-----------+
     */
    test('should allow dragging a view to the east in the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to the east of the workbench grid.
      await view2PO.viewTab.dragTo({grid: 'workbench', region: 'east'});

      // Expect view 2 to be moved to the east of the workbench grid.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MPart({id: MAIN_AREA}),
            child2: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
        },
        mainAreaGrid: {
          root: new MPart({
            id: await view1PO.viewPO.part.getPartId(),
            views: [{id: 'view.1'}],
            activeViewId: 'view.1',
          }),
          activePartId: await view1PO.viewPO.part.getPartId(),
        },
      });
    });

    /**
     * +----------------+--------------+    +-----------+--------------+----------+
     * |                |  RIGHT-TOP   |    |           |  RIGHT-TOP   |          |
     * |                |  [view.3]    |    |           |  [view.3]    |          |
     * |    MAIN-AREA   +--------------+ => | MAIN-AREA +--------------+   EAST   +
     * |[view.1, view.2]| RIGHT-BOTTOM |    | [view.1]  | RIGHT-BOTTOM | [view.2] |
     * |                |  [view.4]    |    |           |  [view.4]    |          |
     * +----------------+--------------+    +-----------+--------------+----------+
     */
    test('should allow dragging a view to the east in the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right-top', {relativeTo: MAIN_AREA, align: 'right', ratio: .25});
      await view1PO.addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'right-top', activateView: true});
      await view1PO.addView('view.4', {partId: 'right-bottom', activateView: true});

      // Move view 2 to the east of the workbench grid.
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      await view2PO.viewTab.dragTo({grid: 'workbench', region: 'east'});

      // Expect view 2 to be moved to the east of the workbench grid.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
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
                  views: [{id: 'view.3'}],
                  activeViewId: 'view.3',
                }),
                child2: new MPart({
                  id: 'right-bottom',
                  views: [{id: 'view.4'}],
                  activeViewId: 'view.4',
                }),
              }),
            }),
            child2: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
        },
        mainAreaGrid: {
          root: new MPart({
            id: await view1PO.viewPO.part.getPartId(),
            views: [{id: 'view.1'}],
            activeViewId: 'view.1',
          }),
          activePartId: await view1PO.viewPO.part.getPartId(),
        },
      });
    });

    /**
     * +------------------+    +-----------+
     * |                  |    | MAIN-AREA |
     * |    MAIN-AREA     |    | [view.1]  |
     * | [view.1, view.2] | => +-----------+
     * |                  |    |   SOUTH   |
     * |                  |    | [view.2]  |
     * +------------------+    +-----------+
     */
    test('should allow dragging a view to the south in the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to the south of the workbench grid.
      await view2PO.viewTab.dragTo({grid: 'workbench', region: 'south'});

      // Expect view 2 to be moved to the south of the workbench grid.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .8,
            child1: new MPart({id: MAIN_AREA}),
            child2: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
        },
        mainAreaGrid: {
          root: new MPart({
            id: await view1PO.viewPO.part.getPartId(),
            views: [{id: 'view.1'}],
            activeViewId: 'view.1',
          }),
          activePartId: await view1PO.viewPO.part.getPartId(),
        },
      });
    });

    /**
     * +----------------------------+    +----------------------------+
     * |                            |    |         MAIN-AREA          |
     * |         MAIN-AREA          |    |          [view.1]          |
     * |     [view.1, view.2]       | => +-------------+--------------+
     * |                            |    | BOTTOM-LEFT | BOTTOM-RIGHT |
     * |                            |    |  [view.3]   |   [view.4    |
     * +-------------+--------------+    +-------------+--------------+
     * | BOTTOM-LEFT | BOTTOM-RIGHT |    |           SOUTH            |
     * |  [view.3]   |   [view.4]   |    |         [view.2]           |
     * +----------------------------+    +----------------------------+
     */
    test('should allow dragging a view to the south in the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom-left', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25});
      await view1PO.addPart('bottom-right', {relativeTo: 'bottom-left', align: 'right', ratio: .6});
      await view1PO.addView('view.3', {partId: 'bottom-left', activateView: true});
      await view1PO.addView('view.4', {partId: 'bottom-right', activateView: true});

      // Move view 2 to the south of the workbench grid.
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      await view2PO.viewTab.dragTo({grid: 'workbench', region: 'south'});

      // Expect view 2 to be moved to the south of the workbench grid.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
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
                  views: [{id: 'view.3'}],
                  activeViewId: 'view.3',
                }),
                child2: new MPart({
                  id: 'bottom-right',
                  views: [{id: 'view.4'}],
                  activeViewId: 'view.4',
                }),
              }),
            }),
            child2: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
        },
        mainAreaGrid: {
          root: new MPart({
            id: await view1PO.viewPO.part.getPartId(),
            views: [{id: 'view.1'}],
            activeViewId: 'view.1',
          }),
          activePartId: await view1PO.viewPO.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+----------+
     * |                 |          |
     * |     MAIN-AREA   |  RIGHT   |
     * | [view.1,view.2] | [view.3] |
     * |                 |          |
     * +-----------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right', {relativeTo: MAIN_AREA, align: 'right'});
      await view1PO.addView('view.3', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
    });

    /**
     * +-----------------+
     * |   MAIN-AREA     |
     * | [view.1,view.2] |
     * +-----------------|
     * |      BOTTOM     |
     * |     [view.3]    |
     * +-----------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
    });

    /**
     * +-----------------+----------+
     * |   MAIN-AREA     |          |
     * | [view.1,view.2] |  RIGHT   |
     * +-----------------| [view.4] |
     * |   BOTTOM-LEFT   |          |
     * |     [view.3]    |          |
     * +-----------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (3)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right', {relativeTo: MAIN_AREA, align: 'right'});
      await view1PO.addPart('bottom-left', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-left', activateView: true});
      await view1PO.addView('view.4', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
    });

    /**
     * +----------+-----------------+
     * |          |   MAIN-AREA     |
     * |   LEFT   | [view.1,view.2] |
     * | [view.4] +-----------------|
     * |          |   BOTTOM-RIGHT  |
     * |          |     [view.3]    |
     * +----------+-----------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (4)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('left', {relativeTo: MAIN_AREA, align: 'left'});
      await view1PO.addPart('bottom-right', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-right', activateView: true});
      await view1PO.addView('view.4', {partId: 'left', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
    });

    /**
     * +----------+-----------------+
     * |          |    MAIN-AREA    |
     * |   LEFT   | [view.1,view.2] |
     * | [view.4] +-----------------|
     * |          |   BOTTOM-RIGHT  |
     * |          |     [view.3]    |
     * +----------+-----------------+
     * |           BOTTOM           |
     * |          [view.5]          |
     * +----------------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (5)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addPart('left', {relativeTo: MAIN_AREA, align: 'left'});
      await view1PO.addPart('bottom-right', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-right', activateView: true});
      await view1PO.addView('view.4', {partId: 'left', activateView: true});
      await view1PO.addView('view.5', {partId: 'bottom', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
    });

    /**
     * +----------+-----------------+----------+
     * |          |   MAIN-AREA     |          |
     * |   LEFT   | [view.1,view.2] |          |
     * | [view.4] +-----------------|          |
     * |          |     MIDDLE      |   RIGHT  |
     * |          |    [view.3]     | [view.6] |
     * +----------+-----------------+          |
     * |           BOTTOM           |          |
     * |          [view.5]          |          |
     * +----------------------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (6)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right', {relativeTo: MAIN_AREA, align: 'right'});
      await view1PO.addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addPart('left', {relativeTo: MAIN_AREA, align: 'left'});
      await view1PO.addPart('middle', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'middle', activateView: true});
      await view1PO.addView('view.4', {partId: 'left', activateView: true});
      await view1PO.addView('view.5', {partId: 'bottom', activateView: true});
      await view1PO.addView('view.6', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
    });

    /**
     * +------------+-----------------+----------+
     * |            |   MAIN-AREA     |          |
     * |    LEFT    | [view.1,view.2] | RIGHT    |
     * | <no views> +-----------------|<no views>|
     * |            | BOTTOM-MIDDLE   |          |
     * |            |     [view.3]    |          |
     * +------------+-----------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (7)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('left', {relativeTo: MAIN_AREA, align: 'left'});
      await view1PO.addPart('right', {relativeTo: MAIN_AREA, align: 'right'});
      await view1PO.addPart('bottom-middle', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-middle', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(true);
    });

    /**
     * +-------------+-----------------+--------------+
     * |   LEFT-TOP  |                 |   RIGHT-TOP  |
     * |  <no views> |   MAIN-AREA     |   <no views> |
     * +-------------+ [view.1,view.2] +--------------+
     * | LEFT-BOTTOM |                 | RIGHT-BOTTOM |
     * | <no views>  |                 |   [view.3]   |
     * +-------------+-----------------+--------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (8)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('left-top', {relativeTo: MAIN_AREA, align: 'left'});
      await view1PO.addPart('right-top', {relativeTo: MAIN_AREA, align: 'right'});
      await view1PO.addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'});
      await view1PO.addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'right-bottom', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
    });

    /**
     * +------------------+----------+
     * |    MAIN-AREA     |   RIGHT  |
     * | [view.1, view.2] | [view.3] |
     * +------------------+----------+
     * |           BOTTOM            |
     * |         <no views>          |
     * +-----------------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the workbench grid (9)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom'});
      await view1PO.addPart('right', {relativeTo: MAIN_AREA, align: 'right'});
      await view1PO.addView('view.3', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveTo({grid: 'workbench'});

      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'east'})).toBe(false);
    });

    /**
     * +------------------+
     * |    MAIN-AREA     |
     * | [view.1, view.2] |
     * +------------------+
     * |     BOTTOM       |
     * |    [view.3]      |
     * +------------------+
     */
    test('should disable drop zone when dragging a view into the tabbar', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPartPO = appPO.part({partId: 'bottom'});
      const bottomTabbarBounds = fromRect(await bottomPartPO.getPartBarBoundingBox());

      // Open view in the initial part.
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Press mouse button on the view tab.
      await view2PO.viewTabPO.mousedown();

      // Move tab to the center of the tabbar of the 'bottom' part.
      await page.mouse.move(bottomTabbarBounds.hcenter, bottomTabbarBounds.vcenter, {steps: 100});

      // Move tab to the beginning of the tabbar.
      await page.mouse.move(0, bottomTabbarBounds.vcenter, {steps: 100});

      // Expect the drop zone to be inactive.
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(false);
    });

    /**
     * +------------------+
     * |    MAIN-AREA     |
     * | [view.1, view.2] |
     * +------------------+
     * |     BOTTOM       |
     * |    [view.3]      |
     * +------------------+
     */
    test('should not disable drop zone when entering tabbar while dragging a view over the drop zone', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPartPO = appPO.part({partId: 'bottom'});
      const bottomTabbarBounds = fromRect(await bottomPartPO.getPartBarBoundingBox());

      // Open view in the initial part.
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Press mouse button on the view tab.
      await view2PO.viewTabPO.mousedown();

      // Move tab into drop zone.
      await page.mouse.move(0, 0, {steps: 1});

      // Move tab along the drop zone into the tabbar of the 'bottom' part.
      await page.mouse.move(0, bottomTabbarBounds.vcenter, {steps: 100});

      // Expect the drop zone to be active.
      await expect(await appPO.isDropZoneActive({grid: 'workbench', region: 'west'})).toBe(true);
    });
  });
});
