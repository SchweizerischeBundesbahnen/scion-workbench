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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom', ratio: .25});
      await layoutPage.addView('view.3', {partId: 'bottom', activateView: true});

      // Move view 2 to the west of the main area.
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.dragTo({grid: 'mainArea', region: 'west'});

      // Expect view 2 to be moved to the west of the main area.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
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
              id: await view2.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .75,
              child1: new MPart({
                id: await layoutPage.view.part.getPartId(),
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
          activePartId: await view2.part.getPartId(),
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom', ratio: .25});
      await layoutPage.addView('view.3', {partId: 'bottom', activateView: true});

      // Move view 2 to the east of the main area.
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.dragTo({grid: 'mainArea', region: 'east'});

      // Expect view 2 to be moved to the east of the main area.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
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
                id: await layoutPage.view.part.getPartId(),
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'right', ratio: .25});
      await layoutPage.addView('view.3', {partId: 'right', activateView: true});

      // Move view 2 to the south of the main area.
      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.dragTo({grid: 'mainArea', region: 'south'});

      // Expect view 2 to be moved to the south of the main area.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
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
                id: await layoutPage.view.part.getPartId(),
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
     * +-----------------+----------+
     * |                 |          |
     * |     INITIAL     |  RIGHT   |
     * | [view.1,view.2] | [view.3] |
     * |                 |          |
     * +-----------------+----------+
     */
    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (1)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'right'});
      await layoutPage.addView('view.3', {partId: 'right', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addView('view.3', {partId: 'bottom', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'right'});
      await layoutPage.addPart('bottom-left', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addView('view.3', {partId: 'bottom-left', activateView: true});
      await layoutPage.addView('view.4', {partId: 'right', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('left', {relativeTo: await layoutPage.view.part.getPartId(), align: 'left'});
      await layoutPage.addPart('bottom-right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addView('view.3', {partId: 'bottom-right', activateView: true});
      await layoutPage.addView('view.4', {partId: 'left', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addPart('left', {relativeTo: await layoutPage.view.part.getPartId(), align: 'left'});
      await layoutPage.addPart('bottom-right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addView('view.3', {partId: 'bottom-right', activateView: true});
      await layoutPage.addView('view.4', {partId: 'left', activateView: true});
      await layoutPage.addView('view.5', {partId: 'bottom', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'right'});
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addPart('left', {relativeTo: await layoutPage.view.part.getPartId(), align: 'left'});
      await layoutPage.addPart('middle', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addView('view.3', {partId: 'middle', activateView: true});
      await layoutPage.addView('view.4', {partId: 'left', activateView: true});
      await layoutPage.addView('view.5', {partId: 'bottom', activateView: true});
      await layoutPage.addView('view.6', {partId: 'right', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('left', {relativeTo: await layoutPage.view.part.getPartId(), align: 'left'});
      await layoutPage.addPart('right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'right'});
      await layoutPage.addPart('bottom-middle', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addView('view.3', {partId: 'bottom-middle', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(true);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('left-top', {relativeTo: await layoutPage.view.part.getPartId(), align: 'left'});
      await layoutPage.addPart('right-top', {relativeTo: await layoutPage.view.part.getPartId(), align: 'right'});
      await layoutPage.addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'});
      await layoutPage.addPart('right-bottom', {relativeTo: 'right-top', align: 'bottom'});
      await layoutPage.addView('view.3', {partId: 'right-bottom', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
    });

    test('should NOT allow dragging a view to the north or a fully adjacent side of the main area (9)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom'});
      await layoutPage.addPart('right', {relativeTo: await layoutPage.view.part.getPartId(), align: 'right'});
      await layoutPage.addView('view.3', {partId: 'right', activateView: true});

      const view2 = (await workbenchNavigator.openInNewTab(ViewPagePO)).view;
      await view2.tab.activateDropZones({grid: 'mainArea'});

      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'north'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'south'})).toBe(true);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'west'})).toBe(false);
      await expect.poll(() => appPO.isDropZoneActive({grid: 'mainArea', region: 'east'})).toBe(false);
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom', ratio: .25});
      await layoutPage.addView('view.3', {partId: 'bottom', activateView: true});
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

      const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
      await layoutPage.addPart('bottom', {relativeTo: await layoutPage.view.part.getPartId(), align: 'bottom', ratio: .25});
      await layoutPage.addView('view.3', {partId: 'bottom', activateView: true});

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
