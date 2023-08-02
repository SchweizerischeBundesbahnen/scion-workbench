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
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('View Drag', () => {

  test.describe('should deactivate view when moving it quickly out of the tabbar', () => {
    test('should deactivate view when moving it quickly to the center', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the center quickly
      const partId = await appPO.activePart.getPartId();
      await view2PO.viewTabPO.dragToPart({region: 'center'}, {steps: 1, performDrop: false});

      // Expect view 1 to be activated
      expect(await view1PO.viewPO.isActive()).toBe(true);
      expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

      // Expect view 2 to be deactivated
      expect(await view2PO.viewPO.isActive()).toBe(false);
      expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the north', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the north quickly
      const partId = await appPO.activePart.getPartId();
      await view2PO.viewTabPO.dragToPart({region: 'north'}, {steps: 1, performDrop: false});

      // Expect view 1 to be activated
      expect(await view1PO.viewPO.isActive()).toBe(true);
      expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

      // Expect view 2 to be deactivated
      expect(await view2PO.viewPO.isActive()).toBe(false);
      expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the east', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the center quickly
      const partId = await appPO.activePart.getPartId();
      await view2PO.viewTabPO.dragToPart({region: 'east'}, {steps: 1, performDrop: false});

      // Expect view 1 to be activated
      expect(await view1PO.viewPO.isActive()).toBe(true);
      expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

      // Expect view 2 to be deactivated
      expect(await view2PO.viewPO.isActive()).toBe(false);
      expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the south', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the south quickly
      const partId = await appPO.activePart.getPartId();
      await view2PO.viewTabPO.dragToPart({region: 'south'}, {steps: 1, performDrop: false});

      // Expect view 1 to be activated
      expect(await view1PO.viewPO.isActive()).toBe(true);
      expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

      // Expect view 2 to be deactivated
      expect(await view2PO.viewPO.isActive()).toBe(false);
      expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
    });

    test('should deactivate view when moving it quickly to the west', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1
      const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 to the west quickly
      const partId = await appPO.activePart.getPartId();
      await view2PO.viewTabPO.dragToPart({region: 'west'}, {steps: 1, performDrop: false});

      // Expect view 1 to be activated
      expect(await view1PO.viewPO.isActive()).toBe(true);
      expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

      // Expect view 2 to be deactivated
      expect(await view2PO.viewPO.isActive()).toBe(false);
      expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
    });
  });

  test.describe('should allow dragging a view to a region of its own part', () => {

    /**
     * +-----------------+    +-----------------+
     * |     INITIAL     | => |     INITIAL     |
     * | [view.1,view.2] |    | [view.1,view.2] |
     * +-----------------+    +-----------------+
     */
    test('should allow dragging a view to the center of its own part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two views in the main area.
      const view1PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to the center.
      await view2PO.viewTab.dragToPart({region: 'center'});

      // Expect view 2 not to be moved.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MPart({
            id: await view1PO.part.getPartId(),
            views: [{id: 'view.1'}, {id: 'view.2'}],
            activeViewId: 'view.2',
          }),
          activePartId: await view1PO.part.getPartId(),
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
      const view1PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to a new part in the west.
      await view2PO.viewTab.dragToPart({region: 'west'});

      // Expect view 2 to be moved to a new part in the west.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MPart({
              id: await view1PO.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
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
      const view1PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to a new part in the east.
      await view2PO.viewTab.dragToPart({region: 'east'});

      // Expect view 2 to be moved to a new part in the east.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: await view1PO.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
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
      const view1PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to a new part in the north.
      await view2PO.viewTab.dragToPart({region: 'north'});

      // Expect view 2 to be moved to a new part in the north.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: await view2PO.part.getPartId(),
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MPart({
              id: await view1PO.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
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
      const view1PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;
      const view2PO = (await workbenchNavigator.openInNewTab(ViewPagePO)).viewPO;

      // Move view 2 to a new part in the south.
      await view2PO.viewTab.dragToPart({region: 'south'});

      // Expect view 2 to be moved to a new part in the south.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: await view1PO.part.getPartId(),
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
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
  });

  test.describe('should allow dragging a view to a region of another part', () => {

    /**
     * +----------+------------------+    +------------------+----------+
     * |  INITIAL |       XYZ        | => |  INITIAL         |   XYZ    |
     * | [view.1] | [view.2, view.3] |    | [view.1, view.2] | [view.3] |
     * +----------+------------------+    +------------------+----------+
     */
    test('should allow dragging a view to the center of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view in the initial part.
      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = appPO.view({viewId: 'view.2'});
      const view3PO = appPO.view({viewId: 'view.3'});

      // Open two views in another part.
      await view1PO.addPart('xyz', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right', ratio: .5});
      await view1PO.addView('view.2', {partId: 'xyz', activateView: true});
      await view1PO.addView('view.3', {partId: 'xyz'});

      // Move view 2 to the center of the initial part.
      await view2PO.viewTab.dragToPart({partId: await view1PO.viewPO.part.getPartId(), region: 'center'});

      // Expect view 2 to be moved to the initial part.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: await view1PO.viewPO.part.getPartId(),
              views: [{id: 'view.1'}, {id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            child2: new MPart({
              id: await view3PO.part.getPartId(),
              views: [{id: 'view.3'}],
              activeViewId: 'view.3',
            }),
          }),
          activePartId: await view1PO.viewPO.part.getPartId(),
        },
      });
    });

    /**
     * +----------+------------------+    +----------+----------+----------+
     * |  INITIAL |       XYZ        | => |  WEST    |  INITIAL |   XYZ    |
     * | [view.1] | [view.2, view.3] |    | [view.2] | [view.1] | [view.3] |
     * +----------+------------------+    +----------+----------+----------+
     */
    test('should allow dragging a view to the west of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view in the initial part.
      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = appPO.view({viewId: 'view.2'});
      const view3PO = appPO.view({viewId: 'view.3'});

      // Open two views in another part.
      await view1PO.addPart('xyz', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right', ratio: .5});
      await view1PO.addView('view.2', {partId: 'xyz', activateView: true});
      await view1PO.addView('view.3', {partId: 'xyz'});

      // Move view 2 to a new part in the west of the initial part.
      await view2PO.viewTab.dragToPart({partId: await view1PO.viewPO.part.getPartId(), region: 'west'});

      // Expect view 2 to be moved to a new part in the west of the initial part.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: await view2PO.part.getPartId(),
                views: [{id: 'view.2'}],
                activeViewId: 'view.2',
              }),
              child2: new MPart({
                id: await view1PO.viewPO.part.getPartId(),
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
            }),
            child2: new MPart({
              id: await view3PO.part.getPartId(),
              views: [{id: 'view.3'}],
              activeViewId: 'view.3',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
        },
      });
    });

    /**
     * +----------+------------------+    +----------+----------+----------+
     * |  INITIAL |       XYZ        | => |  INITIAL |  EAST    |   XYZ    |
     * | [view.1] | [view.2, view.3] |    | [view.1] | [view.2] | [view.3] |
     * +----------+------------------+    +----------+----------+----------+
     */
    test('should allow dragging a view to the east of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view in the initial part.
      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = appPO.view({viewId: 'view.2'});
      const view3PO = appPO.view({viewId: 'view.3'});

      // Open two views in another part.
      await view1PO.addPart('xyz', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right', ratio: .5});
      await view1PO.addView('view.2', {partId: 'xyz', activateView: true});
      await view1PO.addView('view.3', {partId: 'xyz'});

      // Move view 2 to a new part in the east of the initial part.
      await view2PO.viewTab.dragToPart({partId: await view1PO.viewPO.part.getPartId(), region: 'east'});

      // Expect view 2 to be moved to a new part in the east of the initial part.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: await view1PO.viewPO.part.getPartId(),
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
              child2: new MPart({
                id: await view2PO.part.getPartId(),
                views: [{id: 'view.2'}],
                activeViewId: 'view.2',
              }),
            }),
            child2: new MPart({
              id: await view3PO.part.getPartId(),
              views: [{id: 'view.3'}],
              activeViewId: 'view.3',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
        },
      });
    });

    /**
     * +----------+------------------+    +----------+----------+
     * |          |                  |    |  NORTH   |          |
     * |  INITIAL |       XYZ        |    | [view.2] |   XYZ    |
     * | [view.1] | [view.2, view.3] | => +----------+ [view.3] |
     * |          |                  |    |  INITIAL |          |
     * |          |                  |    | [view.1] |          |
     * +----------+------------------+    +----------+----------+
     */
    test('should allow dragging a view to the north of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view in the initial part.
      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = appPO.view({viewId: 'view.2'});
      const view3PO = appPO.view({viewId: 'view.3'});

      // Open two views in another part.
      await view1PO.addPart('xyz', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right', ratio: .5});
      await view1PO.addView('view.2', {partId: 'xyz', activateView: true});
      await view1PO.addView('view.3', {partId: 'xyz'});

      // Move view 2 to a new part in the north of the initial part.
      await view2PO.viewTab.dragToPart({partId: await view1PO.viewPO.part.getPartId(), region: 'north'});

      // Expect view 2 to be moved to a new part in the north of the initial part.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: await view2PO.part.getPartId(),
                views: [{id: 'view.2'}],
                activeViewId: 'view.2',
              }),
              child2: new MPart({
                id: await view1PO.viewPO.part.getPartId(),
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
            }),
            child2: new MPart({
              id: await view3PO.part.getPartId(),
              views: [{id: 'view.3'}],
              activeViewId: 'view.3',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
        },
      });
    });

    /**
     * +----------+------------------+    +----------+----------+
     * |          |                  |    |  INITIAL |          |
     * |  INITIAL |       XYZ        |    | [view.1] |   XYZ    |
     * | [view.1] | [view.2, view.3] | => +----------+ [view.3] |
     * |          |                  |    |  SOUTH   |          |
     * |          |                  |    | [view.2] |          |
     * +----------+------------------+    +----------+----------+
     */
    test('should allow dragging a view to the south of another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view in the initial part.
      const view1PO = await workbenchNavigator.openInNewTab(LayoutPagePO);
      const view2PO = appPO.view({viewId: 'view.2'});
      const view3PO = appPO.view({viewId: 'view.3'});

      // Open two views in another part.
      await view1PO.addPart('another', {relativeTo: await view1PO.viewPO.part.getPartId(), align: 'right', ratio: .5});
      await view1PO.addView('view.2', {partId: 'another', activateView: true});
      await view1PO.addView('view.3', {partId: 'another'});

      // Move view 2 to a new part in the south of the initial part.
      await view2PO.viewTab.dragToPart({partId: await view1PO.viewPO.part.getPartId(), region: 'south'});

      // Expect view 2 to be moved to a new part in the south of the initial part.
      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        mainGrid: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: await view1PO.viewPO.part.getPartId(),
                views: [{id: 'view.1'}],
                activeViewId: 'view.1',
              }),
              child2: new MPart({
                id: await view2PO.part.getPartId(),
                views: [{id: 'view.2'}],
                activeViewId: 'view.2',
              }),
            }),
            child2: new MPart({
              id: await view3PO.part.getPartId(),
              views: [{id: 'view.3'}],
              activeViewId: 'view.3',
            }),
          }),
          activePartId: await view2PO.part.getPartId(),
        },
      });
    });
  });

});
