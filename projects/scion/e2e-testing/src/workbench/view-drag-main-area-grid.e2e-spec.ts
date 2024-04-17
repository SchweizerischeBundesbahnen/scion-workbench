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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );

      // Move test view to the west of the main area.
      await testView.view.tab.dragTo({grid: 'mainArea', region: 'west'});
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the west of the main area.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new MPart({
            id: MAIN_AREA,
          }),
        },
        mainAreaGrid: {
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
                id: initialPartId,
                views: [{id: 'view.101'}],
                activeViewId: 'view.101',
              }),
              child2: new MPart({
                id: 'bottom',
                views: [{id: 'view.102'}],
                activeViewId: 'view.102',
              }),
            }),
          }),
          activePartId: testViewInfo.partId,
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );

      // Move test view to the east of the main area.
      await testView.view.tab.dragTo({grid: 'mainArea', region: 'east'});
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the east of the main area.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new MPart({
            id: MAIN_AREA,
          }),
        },
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .75,
              child1: new MPart({
                id: initialPartId,
                views: [{id: 'view.101'}],
                activeViewId: 'view.101',
              }),
              child2: new MPart({
                id: 'bottom',
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'right', activateView: true}),
      );

      // Move test view to the south of the main area.
      await testView.view.tab.dragTo({grid: 'mainArea', region: 'south'});
      const testViewInfo = await testView.view.getInfo();

      // Expect test view to be moved to the south of the main area.
      await expect(appPO.workbench).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new MPart({
            id: MAIN_AREA,
          }),
        },
        mainAreaGrid: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .8,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .75,
              child1: new MPart({
                id: initialPartId,
                views: [{id: 'view.101'}],
                activeViewId: 'view.101',
              }),
              child2: new MPart({
                id: 'right',
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'right', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right'})
        .addPart('bottom-left', {relativeTo: initialPartId, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-left', activateView: true})
        .addView('view.103', {partId: 'right', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('left', {relativeTo: initialPartId, align: 'left'})
        .addPart('bottom-right', {relativeTo: initialPartId, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-right', activateView: true})
        .addView('view.103', {partId: 'left', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom'})
        .addPart('left', {relativeTo: initialPartId, align: 'left'})
        .addPart('bottom-right', {relativeTo: initialPartId, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-right', activateView: true})
        .addView('view.103', {partId: 'left', activateView: true})
        .addView('view.104', {partId: 'bottom', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('right', {relativeTo: initialPartId, align: 'right'})
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom'})
        .addPart('left', {relativeTo: initialPartId, align: 'left'})
        .addPart('middle', {relativeTo: initialPartId, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'middle', activateView: true})
        .addView('view.103', {partId: 'left', activateView: true})
        .addView('view.104', {partId: 'bottom', activateView: true})
        .addView('view.105', {partId: 'right', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('left', {relativeTo: initialPartId, align: 'left'})
        .addPart('right', {relativeTo: initialPartId, align: 'right'})
        .addPart('bottom-middle', {relativeTo: initialPartId, align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom-middle', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('left-top', {relativeTo: initialPartId, align: 'left'})
        .addPart('right-top', {relativeTo: initialPartId, align: 'right'})
        .addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'})
        .addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'right-bottom', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
    });

    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (9)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom'})
        .addPart('right', {relativeTo: initialPartId, align: 'right'})
        .addView('view.101', {partId: 'right', activateView: true}),
      );

      await testView.view.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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
    test('should disable drop zone when dragging a view into the tabbar', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );
      const workbenchGridDropZoneSize = 50;
      const mainAreaGridDropZoneSize = 100;

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPart = appPO.part({partId: 'bottom'});
      const bottomTabbarBounds = fromRect(await bottomPart.getPartBarBoundingBox());

      // Open view in the initial part.
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Press mouse button on the view tab.
      await viewPage2.view.tab.mousedown();

      // Move tab to the center of the tabbar of the 'bottom' part.
      await page.mouse.move(bottomTabbarBounds.hcenter, bottomTabbarBounds.vcenter, {steps: 100});

      // Move tab to the beginning of the tabbar.
      await page.mouse.move(mainAreaGridDropZoneSize - workbenchGridDropZoneSize + 1, bottomTabbarBounds.vcenter, {steps: 100});

      // Expect the drop zone to be inactive.
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
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
    test('should not disable drop zone when entering tabbar while dragging a view over the drop zone', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const testView = await workbenchNavigator.openInNewTab(ViewPagePO);
      const initialPartId = await testView.view.part.getPartId();

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('bottom', {relativeTo: initialPartId, align: 'bottom', ratio: .25})
        .addView('view.101', {partId: initialPartId})
        .addView('view.102', {partId: 'bottom', activateView: true}),
      );

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPart = appPO.part({partId: 'bottom'});
      const bottomTabbarBounds = fromRect(await bottomPart.getPartBarBoundingBox());

      // Open view in the initial part.
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Press mouse button on the view tab.
      await viewPage2.view.tab.mousedown();

      // Move mouse over main area to activate the drop zone.
      await viewPage2.view.tab.activateDropZones({grid: 'mainArea'});
      const westDropZoneBounds = await appPO.getDropZoneBoundingBox({grid: 'mainArea', region: 'west'});

      // Move mouse to the right edge of the drop zone.
      await page.mouse.move(westDropZoneBounds.right - 1, 0, {steps: 1});

      // Move tab along the drop zone into the tabbar of the 'bottom' part.
      await page.mouse.move(westDropZoneBounds.right - 1, bottomTabbarBounds.vcenter, {steps: 100});

      // Expect the drop zone to be active.
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
    });
  });
});
