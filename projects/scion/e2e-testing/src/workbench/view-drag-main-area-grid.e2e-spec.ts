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

test.describe('View Drag Main Area', () => {

  test.describe('should allow dragging a view to the side of the main area', () => {

    /**
     * +----------------------+    +-------------+-------------------+
     * |       INITIAL        |    |             |     INITIAL       |
     * | [test-view,view.101] |    |   WEST      |    [view.101]     |
     * +----------------------+ => | [test-view] +-------------------+
     * |      BOTTOM          |    |             |      BOTTOM       |
     * |     [view.102]       |    |             |     [view.102]    |
     * +----------------------+    +-------------+-------------------+
     */
    test('should allow dragging a view to the west in the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom', activateView: true}),
      );

      // Move test view to the west of the main area.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToPart(MAIN_AREA, {region: 'west'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the west of the main area.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
          mainArea: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .2,
              child1: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
              child2: new MTreeNode({
                direction: 'column',
                ratio: .75,
                child1: new MPart({
                  id: 'part.initial',
                  views: [{id: 'view.101'}],
                  activeViewId: 'view.101',
                }),
                child2: new MPart({
                  id: 'part.bottom',
                  views: [{id: 'view.102'}],
                  activeViewId: 'view.102',
                }),
              }),
            }),
            activePartId: testViewInfo.partId,
          },
        },
      });
    });

    /**
     * +-------------------+    +-------------------+----------+
     * |      INITIAL      |    |     INITIAL       |          |
     * | [view.1,view.101] |    |    [view.101]     |   EAST   |
     * +-------------------| => +-------------------+ [view.1] |
     * |      BOTTOM       |    |      BOTTOM       |          |
     * |    [view.102]     |    |    [view.102]     |          |
     * +-------------------+    +-------------------+----------+
     */
    test('should allow dragging a view to the east in the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom', activateView: true}),
      );

      // Move test view to the east in the main area.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToPart(MAIN_AREA, {region: 'east'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the east of the main area.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
          mainArea: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .8,
              child1: new MTreeNode({
                direction: 'column',
                ratio: .75,
                child1: new MPart({
                  id: 'part.initial',
                  views: [{id: 'view.101'}],
                  activeViewId: 'view.101',
                }),
                child2: new MPart({
                  id: 'part.bottom',
                  views: [{id: 'view.102'}],
                  activeViewId: 'view.102',
                }),
              }),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
            }),
            activePartId: testViewInfo.partId,
          },
        },
      });
    });

    /**
     * +-------------------+------------+    +-------------+------------+
     * |                   |            |    |   INITIAL   |  RIGHT     |
     * |      INITIAL      |  RIGHT     |    |  [view.101] | [view.102] |
     * | [view.1,view.101] | [view.102] | => +-------------+------------+
     * |                   |            |    |          SOUTH           |
     * |                   |            |    |         [view.1]         |
     * +-------------------+------------+    +--------------------------+
     */
    test('should allow dragging a view to the south in the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.right', activateView: true}),
      );

      // Move test view to the south of the main area.
      const dragHandle = await testView.view.tab.startDrag();
      await dragHandle.dragToPart(MAIN_AREA, {region: 'south'});
      await dragHandle.drop();
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the south of the main area.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
          mainArea: {
            root: new MTreeNode({
              direction: 'column',
              ratio: .8,
              child1: new MTreeNode({
                direction: 'row',
                ratio: .75,
                child1: new MPart({
                  id: 'part.initial',
                  views: [{id: 'view.101'}],
                  activeViewId: 'view.101',
                }),
                child2: new MPart({
                  id: 'part.right',
                  views: [{id: 'view.102'}],
                  activeViewId: 'view.102',
                }),
              }),
              child2: new MPart({
                id: testViewInfo.partId,
                views: [{id: testViewInfo.viewId}],
                activeViewId: testViewInfo.viewId,
              }),
            }),
            activePartId: testViewInfo.partId,
          },
        },
      });
    });

    /**
     * +-------------------+------------+
     * |                   |            |
     * |      INITIAL      |  RIGHT     |
     * | [view.1,view.101] | [view.102] |
     * |                   |            |
     * +-------------------+------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(false);
    });

    /**
     * +-------------------+
     * |      INITIAL      |
     * | [view.1,view.101] |
     * +-------------------|
     * |      BOTTOM       |
     * |     [view.102]    |
     * +-------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(true);
    });

    /**
     * +-------------------+------------+
     * |     INITIAL       |            |
     * | [view.1,view.101] |  RIGHT     |
     * +-------------------| [view.103] |
     * |   BOTTOM-LEFT     |            |
     * |   [view.102]      |            |
     * +-------------------+------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (3)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right'})
        .addPart('part.bottom-left', {relativeTo: 'part.initial', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-left', activateView: true})
        .addView('view.103', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(false);
    });

    /**
     * +------------+-------------------+
     * |            |      INITIAL      |
     * |   LEFT     | [view.1,view.101] |
     * | [view.103] +-------------------|
     * |            |   BOTTOM-RIGHT    |
     * |            |   [view.102]      |
     * +------------+-------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (4)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
        .addPart('part.bottom-right', {relativeTo: 'part.initial', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-right', activateView: true})
        .addView('view.103', {partId: 'part.left', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(true);
    });

    /**
     * +------------+-------------------+
     * |            |      INITIAL      |
     * |   LEFT     | [view.1,view.101] |
     * | [view.103] +-------------------|
     * |            |   BOTTOM-RIGHT    |
     * |            |     [view.102]    |
     * +------------+-------------------+
     * |           BOTTOM               |
     * |          [view.104]            |
     * +--------------------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (5)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom'})
        .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
        .addPart('part.bottom-right', {relativeTo: 'part.initial', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-right', activateView: true})
        .addView('view.103', {partId: 'part.left', activateView: true})
        .addView('view.104', {partId: 'part.bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(true);
    });

    /**
     * +------------+-------------------+------------+
     * |            |      INITIAL      |            |
     * |   LEFT     | [view.1,view.101] |            |
     * | [view.103] +-------------------|            |
     * |            |     MIDDLE        |   RIGHT    |
     * |            |    [view.102]     | [view.105] |
     * +------------+-------------------+            |
     * |            BOTTOM              |            |
     * |          [view.104]            |            |
     * +--------------------------------+------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (6)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right'})
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom'})
        .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
        .addPart('part.middle', {relativeTo: 'part.initial', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.middle', activateView: true})
        .addView('view.103', {partId: 'part.left', activateView: true})
        .addView('view.104', {partId: 'part.bottom', activateView: true})
        .addView('view.105', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(false);
    });

    /**
     * +------------+-------------------+----------+
     * |            |      INITIAL      |          |
     * |    LEFT    | [view.1,view.101] | RIGHT    |
     * | <no views> +-------------------|<no views>|
     * |            | BOTTOM-MIDDLE     |          |
     * |            |     [view.102]    |          |
     * +------------+-------------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (7)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right'})
        .addPart('part.bottom-middle', {relativeTo: 'part.initial', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom-middle', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(true);
    });

    /**
     * +-------------+-------------------+--------------+
     * |   LEFT-TOP  |                   |   RIGHT-TOP  |
     * |  <no views> |      INITIAL      |   <no views> |
     * +-------------+ [view.1,view.101] +--------------+
     * | LEFT-BOTTOM |                   | RIGHT-BOTTOM |
     * | <no views>  |                   |   [view.102] |
     * +-------------+-------------------+--------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (8)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.left-top', {relativeTo: 'part.initial', align: 'left'})
        .addPart('part.right-top', {relativeTo: 'part.initial', align: 'right'})
        .addPart('part.left-bottom', {relativeTo: 'part.left-top', align: 'bottom'})
        .addPart('part.right-bottom', {relativeTo: 'part.right-top', align: 'bottom'})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.right-bottom', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(false);
    });

    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (9)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right'})
        .addView('view.101', {partId: 'part.right', activateView: true}),
      );

      const dragHandle = await testView.view.tab.startDrag();
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'north', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'south', orElse: false})).toBe(true);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', orElse: false})).toBe(false);
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'east', orElse: false})).toBe(false);
    });

    /**
     * +------------------+
     * |      INITIAL     |
     * | [view.1, view.2] |
     * +------------------+
     * |     BOTTOM       |
     * |    [view.3]      |
     * +------------------+
     */
    test('should disable drop zone when dragging a view into the tabbar', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom', ratio: .25})
        .addView('view.1', {partId: 'part.initial'})
        .addView('view.2', {partId: 'part.initial'})
        .addView('view.3', {partId: 'part.bottom'})
        .activateView('view.1')
        .activateView('view.3'),
      );

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomTabbarBounds = fromRect(await appPO.part({partId: 'part.bottom'}).bar.getBoundingBox());

      // Open view in the initial part.
      const view1 = appPO.view({viewId: 'view.1'});

      const dragHandle = await view1.tab.startDrag();

      // Drag to the center of the bottom tabbar.
      await dragHandle.dragTo({x: bottomTabbarBounds.hcenter, y: bottomTabbarBounds.vcenter});

      // Expect the drop zone not to be active if dragging over the tabbar.
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', dragFromCenter: false, orElse: false})).toBe(false);

      // Drag near to the bottom tabbar.
      await dragHandle.dragTo({x: bottomTabbarBounds.hcenter, y: bottomTabbarBounds.vcenter - 100});

      // Expect the drop zone to be active if not dragging over the tabbar.
      await expect.poll(() => dragHandle.dragToPart(MAIN_AREA, {region: 'west', dragFromCenter: false})).toBe(true);
    });

    /**
     * +--------------------+
     * |      INITIAL       |
     * | [view.1, view.101] |
     * +--------------------+
     * |     BOTTOM         |
     * |    [view.102]      |
     * +--------------------+
     */
    test('should not disable drop zone when entering tabbar while dragging a view over the drop zone', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      await workbenchNavigator.openInNewTab(ViewPagePO);

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.activity', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity'}) // add activity to disable drop zones near main grid edges
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom', ratio: .25})
        .addView('view.101', {partId: 'part.initial'})
        .addView('view.102', {partId: 'part.bottom', activateView: true}),
      );

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomTabbarBounds = fromRect(await appPO.part({partId: 'part.bottom'}).bar.getBoundingBox());

      // Open view in the initial part.
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag tab to the right edge of the drop zone.
      const dragHandle = await viewPage2.view.tab.startDrag();
      await dragHandle.dragTo({x: 75, y: 0}); // main area drop zone is 100px wide

      // Drag tab along the drop zone into the tabbar of the 'bottom' part.
      await dragHandle.dragTo({x: 75, y: bottomTabbarBounds.vcenter});

      // Expect the drop zone to be active.
      await expect.poll(() => appPO.part({partId: MAIN_AREA}).getActiveDropZone()).toEqual('west');
    });
  });
});
