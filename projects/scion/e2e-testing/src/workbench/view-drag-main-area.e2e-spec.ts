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
import {MAIN_AREA_PART_ID} from '../workbench.model';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('View Drag Main Area', () => {

  test.describe('should allow dragging a view to the side of the main area', () => {

    /**
     * +-----------------+    +----------+-----------------+
     * |     INITIAL     |    |          |     INITIAL     |
     * | [view.1,view.2] |    |   WEST   |    [view.1]     |
     * +-----------------+ => | [view.2] +-----------------+
     * |      BOTTOM     |    |          |      BOTTOM     |
     * |     [view.3]    |    |          |     [view.3]    |
     * +-----------------+    +----------+-----------------+
     */
    test('should allow dragging a view to the west in the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});

      // Move view 2 to the west of the main area.
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      await view2PO.viewTab.dragToArea({area: 'main-area', region: 'west'});

      // Expect view 2 to be moved to the west of the main area.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        peripheralGrid: {
          root: new MPart({
            id: MAIN_AREA_PART_ID,
          }),
        },
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .2,
            child1: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .75,
              child1: new MPart({
                id: await view1PO.viewPO.part.getPartId(),
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
              child2: new MPart({
                id: await appPO.view({viewId: 'view.3'}).part.getPartId(),
                views: [{id: 'view.3'}],
                activeViewId: 'view.3',
              }),
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+    +-----------------+----------+
     * |     INITIAL     |    |     INITIAL     |          |
     * | [view.1,view.2] |    |    [view.1]     |   EAST   |
     * +-----------------| => +-----------------+ [view.2] |
     * |      BOTTOM     |    |      BOTTOM     |          |
     * |     [view.3]    |    |     [view.3]    |          |
     * +-----------------+    +-----------------+----------+
     */
    test('should allow dragging a view to the east in the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});

      // Move view 2 to the east of the main area.
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      await view2PO.viewTab.dragToArea({area: 'main-area', region: 'east'});

      // Expect view 2 to be moved to the east of the main area.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        peripheralGrid: {
          root: new MPart({
            id: MAIN_AREA_PART_ID,
          }),
        },
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .75,
              child1: new MPart({
                id: await view1PO.viewPO.part.getPartId(),
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
              child2: new MPart({
                id: await appPO.view({viewId: 'view.3'}).part.getPartId(),
                views: [{id: 'view.3'}],
                activeViewId: 'view.3',
              }),
            }),
            child2: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+----------+    +-------------+----------+
     * |                 |          |    |   INITIAL   |  RIGHT   |
     * |     INITIAL     |  RIGHT   |    |  [view.1]   | [view.3] |
     * | [view.1,view.2] | [view.3] | => +-------------+----------+
     * |                 |          |    |          SOUTH         |
     * |                 |          |    |         [view.2]       |
     * +-----------------+----------+    +------------------------+
     */
    test('should allow dragging a view to the south in the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right', ratio: .25});
      await view1PO.addView('view.3', {partId: 'right', activateView: true});

      // Move view 2 to the south of the main area.
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      await view2PO.viewTab.dragToArea({area: 'main-area', region: 'south'});

      // Expect view 2 to be moved to the south of the main area.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        peripheralGrid: {
          root: new MPart({
            id: MAIN_AREA_PART_ID,
          }),
        },
        mainGrid: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .8,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .75,
              child1: new MPart({
                id: await view1PO.viewPO.part.getPartId(),
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
              child2: new MPart({
                id: await appPO.view({viewId: 'view.3'}).part.getPartId(),
                views: [{id: 'view.3'}],
                activeViewId: 'view.3',
              }),
            }),
            child2: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
        },
      });
    });

    /**
     * +-----------------+----------+
     * |                 |          |
     * |     INITIAL     |  RIGHT   |
     * | [view.1,view.2] | [view.3] |
     * |                 |          |
     * +-----------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right'});
      await view1PO.addView('view.3', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(false);
    });

    /**
     * +-----------------+
     * |     INITIAL     |
     * | [view.1,view.2] |
     * +-----------------|
     * |      BOTTOM     |
     * |     [view.3]    |
     * +-----------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (2)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(true);
    });

    /**
     * +-----------------+----------+
     * |     INITIAL     |          |
     * | [view.1,view.2] |  RIGHT   |
     * +-----------------| [view.4] |
     * |   BOTTOM-LEFT   |          |
     * |     [view.3]    |          |
     * +-----------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (3)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right'});
      await view1PO.addPart('bottom-left', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-left', activateView: true});
      await view1PO.addView('view.4', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(false);
    });

    /**
     * +----------+-----------------+
     * |          |     INITIAL     |
     * |   LEFT   | [view.1,view.2] |
     * | [view.4] +-----------------|
     * |          |   BOTTOM-RIGHT  |
     * |          |     [view.3]    |
     * +----------+-----------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (4)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('left', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'left'});
      await view1PO.addPart('bottom-right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-right', activateView: true});
      await view1PO.addView('view.4', {partId: 'left', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(true);
    });

    /**
     * +----------+-----------------+
     * |          |     INITIAL     |
     * |   LEFT   | [view.1,view.2] |
     * | [view.4] +-----------------|
     * |          |   BOTTOM-RIGHT  |
     * |          |     [view.3]    |
     * +----------+-----------------+
     * |           BOTTOM           |
     * |          [view.5]          |
     * +----------------------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (5)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addPart('left', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'left'});
      await view1PO.addPart('bottom-right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-right', activateView: true});
      await view1PO.addView('view.4', {partId: 'left', activateView: true});
      await view1PO.addView('view.5', {partId: 'bottom', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(true);
    });

    /**
     * +----------+-----------------+----------+
     * |          |     INITIAL     |          |
     * |   LEFT   | [view.1,view.2] |          |
     * | [view.4] +-----------------|          |
     * |          |     MIDDLE      |   RIGHT  |
     * |          |    [view.3]     | [view.6] |
     * +----------+-----------------+          |
     * |           BOTTOM           |          |
     * |          [view.5]          |          |
     * +----------------------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (6)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right'});
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addPart('left', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'left'});
      await view1PO.addPart('middle', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'middle', activateView: true});
      await view1PO.addView('view.4', {partId: 'left', activateView: true});
      await view1PO.addView('view.5', {partId: 'bottom', activateView: true});
      await view1PO.addView('view.6', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(false);
    });

    /**
     * +------------+-----------------+----------+
     * |            |     INITIAL     |          |
     * |    LEFT    | [view.1,view.2] | RIGHT    |
     * | <no views> +-----------------|<no views>|
     * |            | BOTTOM-MIDDLE   |          |
     * |            |     [view.3]    |          |
     * +------------+-----------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (7)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('left', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'left'});
      await view1PO.addPart('right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right'});
      await view1PO.addPart('bottom-middle', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'bottom-middle', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(true);
    });

    /**
     * +-------------+-----------------+--------------+
     * |   LEFT-TOP  |                 |   RIGHT-TOP  |
     * |  <no views> |     INITIAL     |   <no views> |
     * +-------------+ [view.1,view.2] +--------------+
     * | LEFT-BOTTOM |                 | RIGHT-BOTTOM |
     * | <no views>  |                 |   [view.3]   |
     * +-------------+-----------------+--------------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (8)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('left-top', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'left'});
      await view1PO.addPart('right-top', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right'});
      await view1PO.addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'});
      await view1PO.addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'});
      await view1PO.addView('view.3', {partId: 'right-bottom', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(false);
    });

    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (9)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom'});
      await view1PO.addPart('right', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right'});
      await view1PO.addView('view.3', {partId: 'right', activateView: true});

      const viewTab2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewTabPO;
      await viewTab2PO.moveToArea('main-area');

      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'north'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'south'})).toBe(true);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(false);
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'east'})).toBe(false);
    });

    /**
     * +------------------+
     * |    INITIAL       |
     * | [view.1, view.2] |
     * +------------------+
     * |     BOTTOM       |
     * |    [view.3]      |
     * +------------------+
     */
    test('should disable drop zone when dragging a view into the tabbar', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});
      const mainAreaDropZoneSize = 100;
      const peripheralAreaDropZoneSize = 50;

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
      await page.mouse.move(mainAreaDropZoneSize - peripheralAreaDropZoneSize + 1, bottomTabbarBounds.vcenter, {steps: 100});

      // Expect the drop zone to be inactive.
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(false);
    });

    /**
     * +------------------+
     * |    INITIAL       |
     * | [view.1, view.2] |
     * +------------------+
     * |     BOTTOM       |
     * |    [view.3]      |
     * +------------------+
     */
    test('should not disable drop zone when entering tabbar while dragging a view over the drop zone', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await view1PO.addPart('bottom', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'bottom', ratio: .25});
      await view1PO.addView('view.3', {partId: 'bottom', activateView: true});

      // Get bounding box of the tabbar of the 'bottom' part.
      const bottomPartPO = appPO.part({partId: 'bottom'});
      const bottomTabbarBounds = fromRect(await bottomPartPO.getPartBarBoundingBox());

      // Open view in the initial part.
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Press mouse button on the view tab.
      await view2PO.viewTabPO.mousedown();

      // Move mouse over main area to activate the drop zone.
      await view2PO.viewTabPO.moveToArea('main-area');
      const westDropZoneBounds = await appPO.getDropZoneBoundingBox({area: 'main-area', region: 'west'});

      // Move mouse to the right edge of the drop zone.
      await page.mouse.move(westDropZoneBounds.right - 1, 0, {steps: 1});

      // Move tab along the drop zone into the tabbar of the 'bottom' part.
      await page.mouse.move(westDropZoneBounds.right - 1, bottomTabbarBounds.vcenter, {steps: 100});

      // Expect the drop zone to be active.
      await expect(await appPO.isDropZoneActive({area: 'main-area', region: 'west'})).toBe(true);
    });
  });
});
