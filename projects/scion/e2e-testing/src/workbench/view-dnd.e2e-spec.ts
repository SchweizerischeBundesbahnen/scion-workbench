/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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

  test.describe('drag to own part', () => {

    test('should deactivate view when moving view quickly out of the tabbar', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open view 1
      const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open view 2
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Drag view 2 quickly out of the tabbar
      const dragHandle = await viewPage2.view.tab.startDrag();
      await dragHandle.dragTo({deltaX: 0, deltaY: 500}, {steps: 1});

      // Expect view 1 to be activated
      await expectView(viewPage1).toBeActive();
      await expect.poll(() => viewPage1.view.part.getPartId()).toEqual('part.initial');

      // Expect view 2 not to be attached
      await expect(viewPage2.view.locator).not.toBeAttached();
      await expect(viewPage2.view.tab.locator).not.toBeVisible();
      await expect.poll(() => viewPage2.view.part.getPartId()).toEqual('part.initial');
    });

    /**
     * +-----------------+    +-----------------+
     * |     INITIAL     | => |     INITIAL     |
     * | [view.1,view.2] |    | [view.1,view.2] |
     * +-----------------+    +-----------------+
     */
    test('should allow dragging a view to the center of its own part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in the main area.
      await workbenchNavigator.modifyLayout(factory => factory
        .addView('view.1', {partId: 'part.initial'})
        .addView('view.2', {partId: 'part.initial'}),
      );
      const view1 = appPO.view({viewId: 'view.1'});
      const view2 = appPO.view({viewId: 'view.2'});

      // Move view 2 to the center.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'center'});
      await dragHandle.drop();

      // Expect view 2 not to be moved.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
            root: new MPart({
              id: await view1.part.getPartId(),
              views: [{id: 'view.1'}, {id: 'view.2'}],
              activeViewId: 'view.2',
            }),
            activePartId: await view1.part.getPartId(),
          },
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in the main area.
      await workbenchNavigator.modifyLayout(factory => factory
        .addView('view.1', {partId: 'part.initial'})
        .addView('view.2', {partId: 'part.initial'}),
      );
      const view1 = appPO.view({viewId: 'view.1'});
      const view2 = appPO.view({viewId: 'view.2'});

      // Move view 2 to a new part in the west.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'west'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the west.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in the main area.
      await workbenchNavigator.modifyLayout(factory => factory
        .addView('view.1', {partId: 'part.initial'})
        .addView('view.2', {partId: 'part.initial'}),
      );
      const view1 = appPO.view({viewId: 'view.1'});
      const view2 = appPO.view({viewId: 'view.2'});

      // Move view 2 to a new part in the east.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the east.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in the main area.
      await workbenchNavigator.modifyLayout(factory => factory
        .addView('view.1', {partId: 'part.initial'})
        .addView('view.2', {partId: 'part.initial'}),
      );
      const view1 = appPO.view({viewId: 'view.1'});
      const view2 = appPO.view({viewId: 'view.2'});

      // Move view 2 to a new part in the north.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'north'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the north.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in the main area.
      await workbenchNavigator.modifyLayout(factory => factory
        .addView('view.1', {partId: 'part.initial'})
        .addView('view.2', {partId: 'part.initial'}),
      );
      const view1 = appPO.view({viewId: 'view.1'});
      const view2 = appPO.view({viewId: 'view.2'});

      // Move view 2 to a new part in the south.
      const dragHandle = await view2.tab.startDrag();
      await dragHandle.dragToPart(await view2.part.getPartId(), {region: 'south'});
      await dragHandle.drop();

      // Expect view 2 to be moved to a new part in the south.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.1', {partId: 'part.initial'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right', ratio: .5})
        .addView('view.101', {partId: 'part.right', activateView: true})
        .addView('view.102', {partId: 'part.right'}),
      );

      // Move view to the center of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart('part.initial', {region: 'center'});
      await dragHandle.drop();

      // Expect view to be moved to the initial part.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.initial',
                views: [{id: 'view.1'}, {id: 'view.101'}],
                activeViewId: 'view.101',
              }),
              child2: new MPart({
                id: 'part.right',
                views: [{id: 'view.102'}],
                activeViewId: 'view.102',
              }),
            }),
            activePartId: 'part.initial',
          },
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.1', {partId: 'part.initial'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right', ratio: .5})
        .addView('view.101', {partId: 'part.right', activateView: true})
        .addView('view.102', {partId: 'part.right'}),
      );

      // Move view to a new part in the west of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart('part.initial', {region: 'west'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the west of the initial part.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
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
                  id: 'part.initial',
                  views: [{id: 'view.1'}],
                  activeViewId: 'view.1',
                }),
              }),
              child2: new MPart({
                id: 'part.right',
                views: [{id: 'view.102'}],
                activeViewId: 'view.102',
              }),
            }),
            activePartId: testViewInfo.partId,
          },
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.1', {partId: 'part.initial'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right', ratio: .5})
        .addView('view.101', {partId: 'part.right', activateView: true})
        .addView('view.102', {partId: 'part.right'}),
      );

      // Move view to a new part in the east of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart('part.initial', {region: 'east'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the east of the initial part.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MTreeNode({
                direction: 'row',
                ratio: .5,
                child1: new MPart({
                  id: 'part.initial',
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
                id: 'part.right',
                views: [{id: 'view.102'}],
                activeViewId: 'view.102',
              }),
            }),
            activePartId: testViewInfo.partId,
          },
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.1', {partId: 'part.initial'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right', ratio: .5})
        .addView('view.101', {partId: 'part.right', activateView: true})
        .addView('view.102', {partId: 'part.right'}),
      );

      // Move view to a new part in the north of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart('part.initial', {region: 'north'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the north of the initial part.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
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
                  id: 'part.initial',
                  views: [{id: 'view.1'}],
                  activeViewId: 'view.1',
                }),
              }),
              child2: new MPart({
                id: 'part.right',
                views: [{id: 'view.102'}],
                activeViewId: 'view.102',
              }),
            }),
            activePartId: testViewInfo.partId,
          },
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
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Open two views in another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.1', {partId: 'part.initial'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right', ratio: .5})
        .addView('view.101', {partId: 'part.right', activateView: true})
        .addView('view.102', {partId: 'part.right'}),
      );

      // Move view to a new part in the south of the initial part.
      const testView = appPO.view({viewId: 'view.101'});
      const dragHandle = await testView.tab.startDrag();
      await dragHandle.dragToPart('part.initial', {region: 'south'});
      await dragHandle.drop();
      const testViewInfo = await testView.getInfo();

      // Expect view to be moved to a new part in the south of the initial part.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          mainArea: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MTreeNode({
                direction: 'column',
                ratio: .5,
                child1: new MPart({
                  id: 'part.initial',
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
                id: 'part.right',
                views: [{id: 'view.102'}],
                activeViewId: 'view.102',
              }),
            }),
            activePartId: testViewInfo.partId,
          },
        },
      });
    });
  });

  test.describe('drag to main area', () => {

    test('should drop view on navigated main area part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addView('view.100', {partId: 'part.left'})
        .navigatePart(MAIN_AREA, ['test-part'])
        .navigateView('view.100', ['test-view']),
      );

      const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
      await expect.poll(() => testeeViewPage.view.part.isPeripheral()).toBe(true);

      // Drop view on the main area.
      const dragHandle = await testeeViewPage.view.tab.startDrag();
      await dragHandle.dragToPart(MAIN_AREA, {region: 'center'});
      await dragHandle.drop();

      // Expect view to be moved to the main area.
      await expectView(testeeViewPage).toBeActive();
      await expect.poll(() => testeeViewPage.view.part.isPeripheral()).toBe(false);
    });

    test('should drop view on desktop of the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addView('view.100', {partId: 'part.left'})
        .navigateView('view.100', ['test-view']),
      );

      // Drop view on the main area.
      const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
      const dragHandle = await testeeViewPage.view.tab.startDrag();
      await dragHandle.dragToPart(MAIN_AREA, {region: 'center'});
      await dragHandle.drop();

      // Expect view to be moved to the main area.
      await expectView(testeeViewPage).toBeActive();
      await expect.poll(() => testeeViewPage.view.part.isPeripheral()).toBe(false);
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

  test.describe('drop zone', () => {

    test('should activate drop zone when dragging over a view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(layout => layout
        .addPart('part.part')
        .addView('view.101', {partId: 'part.part'})
        .addView('view.102', {partId: 'part.part'}),
      );
      const tab1 = appPO.view({viewId: 'view.101'}).tab;
      await tab1.setTitle('view.101');

      const tab2 = appPO.view({viewId: 'view.102'}).tab;
      await tab2.setTitle('view.102');

      const part = appPO.part({partId: 'part.part'});
      const {top, right, bottom, left, vcenter, hcenter} = await part.activeView.getBoundingBox();

      const dragHandle = await tab1.startDrag();

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');
      });

      await test.step('drag to the north/east', async () => {
        await dragHandle.dragTo({x: right - 10, y: top + 9});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');

        await dragHandle.dragTo({x: right - 10, y: top + 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');

        await dragHandle.dragTo({x: right - 10, y: top + 11});
        await expect.poll(() => part.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the south/east', async () => {
        await dragHandle.dragTo({x: right - 10, y: bottom - 11});
        await expect.poll(() => part.getActiveDropZone()).toEqual('east');

        await dragHandle.dragTo({x: right - 10, y: bottom - 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');

        await dragHandle.dragTo({x: right - 10, y: bottom - 9});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');
      });

      await test.step('drag to the south/west', async () => {
        await dragHandle.dragTo({x: left + 10, y: bottom - 9});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');

        await dragHandle.dragTo({x: left + 10, y: bottom - 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');

        await dragHandle.dragTo({x: left + 10, y: bottom - 11});
        await expect.poll(() => part.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the north/west', async () => {
        await dragHandle.dragTo({x: left + 10, y: top + 11});
        await expect.poll(() => part.getActiveDropZone()).toEqual('west');

        await dragHandle.dragTo({x: left + 10, y: top + 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');

        await dragHandle.dragTo({x: left + 10, y: top + 9});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');
      });

      await test.step('drag to the center', async () => {
        await dragHandle.dragTo({x: hcenter, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');

        await dragHandle.dragTo({x: hcenter - 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');

        await dragHandle.dragTo({x: hcenter + 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');

        await dragHandle.dragTo({x: hcenter, y: vcenter - 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');

        await dragHandle.dragTo({x: hcenter, y: vcenter + 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');
      });
    });

    test('should activate drop zone when dragging the only view of a part over its part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(layout => layout
        .addPart('part.part')
        .addView('view.100', {partId: 'part.part'}),
      );
      const tab = appPO.view({viewId: 'view.100'}).tab;
      await tab.setTitle('view.100');

      const part = appPO.part({partId: 'part.part'});
      const {top, right, bottom, left, vcenter, hcenter} = await part.activeView.getBoundingBox();

      const dragHandle = await tab.startDrag();

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 10});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the center', async () => {
        await dragHandle.dragTo({x: hcenter, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('center');
      });
    });

    test('should activate drop zone when dragging over a navigated part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(layout => layout
        .addPart('part.left')
        .addPart('part.right', {align: 'right', ratio: .75})
        .addView('view.100', {partId: 'part.left'})
        .navigatePart('part.right', ['test-part']),
      );
      const tab = appPO.view({viewId: 'view.100'}).tab;
      const part = appPO.part({partId: 'part.right'});
      const {top, right, bottom, left, vcenter, hcenter} = await part.getBoundingBox('content');

      const dragHandle = await tab.startDrag();

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 75});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');
      });

      await test.step('drag to the north/east', async () => {
        await dragHandle.dragTo({x: right - 75, y: top + 74});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');

        await dragHandle.dragTo({x: right - 75, y: top + 76});
        await expect.poll(() => part.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 75, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the south/east', async () => {
        await dragHandle.dragTo({x: right - 75, y: bottom - 76});
        await expect.poll(() => part.getActiveDropZone()).toEqual('east');

        await dragHandle.dragTo({x: right - 75, y: bottom - 74});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 75});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');
      });

      await test.step('drag to the south/west', async () => {
        await dragHandle.dragTo({x: left + 75, y: bottom - 74});
        await expect.poll(() => part.getActiveDropZone()).toEqual('south');

        await dragHandle.dragTo({x: left + 75, y: bottom - 76});
        await expect.poll(() => part.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 75, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the north/west', async () => {
        await dragHandle.dragTo({x: left + 75, y: top + 76});
        await expect.poll(() => part.getActiveDropZone()).toEqual('west');

        await dragHandle.dragTo({x: left + 75, y: top + 74});
        await expect.poll(() => part.getActiveDropZone()).toEqual('north');
      });

      await test.step('drag to the center', async () => {
        await dragHandle.dragTo({x: hcenter, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).not.toBeNull();
        await expect.poll(() => part.getActiveDropZone()).not.toEqual('center');

        await dragHandle.dragTo({x: hcenter - 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).not.toBeNull();
        await expect.poll(() => part.getActiveDropZone()).not.toEqual('center');

        await dragHandle.dragTo({x: hcenter + 10, y: vcenter});
        await expect.poll(() => part.getActiveDropZone()).not.toBeNull();
        await expect.poll(() => part.getActiveDropZone()).not.toEqual('center');

        await dragHandle.dragTo({x: hcenter, y: vcenter - 10});
        await expect.poll(() => part.getActiveDropZone()).not.toBeNull();
        await expect.poll(() => part.getActiveDropZone()).not.toEqual('center');

        await dragHandle.dragTo({x: hcenter, y: vcenter + 10});
        await expect.poll(() => part.getActiveDropZone()).not.toBeNull();
        await expect.poll(() => part.getActiveDropZone()).not.toEqual('center');
      });
    });

    test('should activate drop zone when dragging over the navigated main area part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(layout => layout
        .addPart('part.left')
        .addPart(MAIN_AREA, {align: 'right', ratio: .75})
        .addView('view.100', {partId: 'part.left'})
        .navigatePart(MAIN_AREA, ['test-part']),
      );
      const tab = appPO.view({viewId: 'view.100'}).tab;
      const mainAreaPart = appPO.part({partId: MAIN_AREA});
      const {top, right, bottom, left, vcenter, hcenter} = await mainAreaPart.getBoundingBox('content');

      const dragHandle = await tab.startDrag();

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 75});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 75, y: vcenter});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 75});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 75, y: vcenter});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the center', async () => {
        await dragHandle.dragTo({x: hcenter, y: vcenter});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('center');
      });
    });

    test('should activate drop zone when dragging over the desktop of the main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      await workbenchNavigator.createPerspective(layout => layout.addPart(MAIN_AREA));
      await workbenchNavigator.modifyLayout(layout => layout.addView('view.100', {partId: 'part.initial'}));

      const tab = appPO.view({viewId: 'view.100'}).tab;
      const mainAreaPart = appPO.part({partId: MAIN_AREA});
      const {top, right, bottom, left, vcenter, hcenter} = await mainAreaPart.getBoundingBox('content');

      const dragHandle = await tab.startDrag();
      await dragHandle.dragTo({x: hcenter, y: vcenter});

      // Close view to display the desktop.
      await appPO.workbench.closeViews('view.100');

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 75});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 75, y: vcenter});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 75});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 75, y: vcenter});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the center', async () => {
        await dragHandle.dragTo({x: hcenter, y: vcenter});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });
    });

    test('should activate drop zone when dragging over the desktop of the workbench', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(layout => layout
        .addPart('part.part')
        .addView('view.100', {partId: 'part.part'}),
      );
      const tab = appPO.view({viewId: 'view.100'}).tab;
      const {top, right, bottom, left, vcenter, hcenter} = await appPO.workbenchBoundingBox();

      const dragHandle = await tab.startDrag();
      await dragHandle.dragTo({x: hcenter, y: vcenter});

      // Close view to display the desktop.
      await appPO.workbench.closeViews('view.100');

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 75});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 75, y: vcenter});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 75});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 75, y: vcenter});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the center', async () => {
        await dragHandle.dragTo({x: hcenter, y: vcenter});
        await expect.poll(() => appPO.desktop.getActiveDropZone()).toEqual('center');
      });
    });

    test('should activate drop zone of main grid for layouts without activities', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Create perspective with a main area.
      await workbenchNavigator.createPerspective(factory => factory.addPart(MAIN_AREA));

      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.100', {partId: 'part.initial'})
        .navigateView('view.100', ['test-view']),
      );
      const tab = appPO.view({viewId: 'view.100'}).tab;
      const mainGrid = appPO.grid({grid: 'main'});
      const mainAreaPart = appPO.part({partId: MAIN_AREA});
      const {top, right, bottom, left, vcenter, hcenter} = await mainAreaPart.getBoundingBox('content');

      const dragHandle = await tab.startDrag();

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 40});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the north/east', async () => {
        await dragHandle.dragTo({x: right - 40, y: top + 39});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');

        await dragHandle.dragTo({x: right - 40, y: top + 41});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 40, y: vcenter});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the south/east', async () => {
        await dragHandle.dragTo({x: right - 40, y: bottom - 41});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');

        await dragHandle.dragTo({x: right - 40, y: bottom - 39});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('south');
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 40});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('south');
      });

      await test.step('drag to the south/west', async () => {
        await dragHandle.dragTo({x: left + 40, y: bottom - 39});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('south');

        await dragHandle.dragTo({x: left + 40, y: bottom - 41});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 40, y: vcenter});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the north/west', async () => {
        await dragHandle.dragTo({x: left + 40, y: top + 41});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');

        await dragHandle.dragTo({x: left + 40, y: top + 39});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
      });
    });

    test('should activate drop zone of main grid for layouts with activities but no main area (north, south)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Create perspective with a docked part but no main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
        .addView('view.100', {partId: 'part.left'})
        .addView('view.101', {partId: 'part.left'})
        .addView('view.102', {partId: 'part.right'}),
      );

      const tab = appPO.view({viewId: 'view.100'}).tab;
      const leftPart = appPO.part({partId: 'part.left'});
      const rightPart = appPO.part({partId: 'part.right'});
      const mainGrid = appPO.grid({grid: 'main'});

      const leftPartBoundingBox = await leftPart.getBoundingBox('content');
      const rightPartBoundingBox = await rightPart.getBoundingBox('content');
      const mainGridBoundingBox = await mainGrid.getBoundingBox();

      const dragHandle = await tab.startDrag();

      await test.step('drag to the north of part.left', async () => {
        await dragHandle.dragTo({x: leftPartBoundingBox.hcenter, y: leftPartBoundingBox.top + 40});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftPart.getActiveDropZone()).toEqual('north');
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the north between part.left and part.right', async () => {
        await dragHandle.dragTo({x: mainGridBoundingBox.hcenter, y: mainGridBoundingBox.top + 40});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the north of part.right', async () => {
        await dragHandle.dragTo({x: rightPartBoundingBox.hcenter, y: rightPartBoundingBox.top + 40});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => rightPart.getActiveDropZone()).toEqual('north');
      });

      await test.step('drag to the south of part.left', async () => {
        await dragHandle.dragTo({x: leftPartBoundingBox.hcenter, y: leftPartBoundingBox.bottom - 40});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('south');
        await expect.poll(() => leftPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the south between part.left and part.right', async () => {
        await dragHandle.dragTo({x: mainGridBoundingBox.hcenter, y: mainGridBoundingBox.bottom - 40});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('south');
        await expect.poll(() => leftPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the south of part.right', async () => {
        await dragHandle.dragTo({x: rightPartBoundingBox.hcenter, y: rightPartBoundingBox.bottom - 40});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('south');
        await expect.poll(() => leftPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
      });
    });

    test('should activate drop zone of main grid for layouts with activities but no main area (west, east)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Create perspective with a docked part but no main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.top')
        .addPart('part.bottom', {align: 'bottom'})
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
        .addView('view.100', {partId: 'part.top'})
        .addView('view.101', {partId: 'part.top'})
        .addView('view.102', {partId: 'part.bottom'}),
      );

      const tab = appPO.view({viewId: 'view.100'}).tab;
      const topPart = appPO.part({partId: 'part.top'});
      const bottomPart = appPO.part({partId: 'part.bottom'});
      const mainGrid = appPO.grid({grid: 'main'});

      const topPartBoundingBox = await topPart.getBoundingBox('content');
      const bottomPartBoundingBox = await bottomPart.getBoundingBox('content');
      const mainGridBoundingBox = await mainGrid.getBoundingBox();

      const dragHandle = await tab.startDrag();

      await test.step('drag to the west of part.top', async () => {
        await dragHandle.dragTo({x: topPartBoundingBox.left + 40, y: topPartBoundingBox.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
        await expect.poll(() => topPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => bottomPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the west between part.top and part.bottom', async () => {
        await dragHandle.dragTo({x: mainGridBoundingBox.left + 40, y: mainGridBoundingBox.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
        await expect.poll(() => topPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => bottomPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the west of part.bottom', async () => {
        await dragHandle.dragTo({x: bottomPartBoundingBox.left + 40, y: bottomPartBoundingBox.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
        await expect.poll(() => topPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => bottomPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the east of part.top', async () => {
        await dragHandle.dragTo({x: topPartBoundingBox.right - 40, y: topPartBoundingBox.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');
        await expect.poll(() => topPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => bottomPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the east between part.top and part.bottom', async () => {
        await dragHandle.dragTo({x: mainGridBoundingBox.right - 40, y: mainGridBoundingBox.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');
        await expect.poll(() => topPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => bottomPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the east of part.bottom', async () => {
        await dragHandle.dragTo({x: bottomPartBoundingBox.right - 40, y: bottomPartBoundingBox.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');
        await expect.poll(() => topPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => bottomPart.getActiveDropZone()).toBeNull();
      });
    });

    test('should not activate drop zone of main grid for layouts with activities and a main area', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      // Create perspective with a docked part.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'}),
      );

      // Add test view to main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.100', {partId: 'part.initial'})
        .navigateView('view.100', ['test-view']),
      );

      const tab = appPO.view({viewId: 'view.100'}).tab;
      const mainGrid = appPO.grid({grid: 'main'});
      const mainAreaPart = appPO.part({partId: MAIN_AREA});
      const {top, right, bottom, left, vcenter, hcenter} = await mainAreaPart.getBoundingBox('content');

      const dragHandle = await tab.startDrag();

      await test.step('drag to the north', async () => {
        await dragHandle.dragTo({x: hcenter, y: top + 40});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the east', async () => {
        await dragHandle.dragTo({x: right - 40, y: vcenter});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the south', async () => {
        await dragHandle.dragTo({x: hcenter, y: bottom - 40});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the west', async () => {
        await dragHandle.dragTo({x: left + 40, y: vcenter});
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });
    });

    /**
     * This test operates on the following layout, dragging a view tab from the left-top part
     * to the mid-top part and back again.
     *
     *
     *   PERIPHERY       MAIN AREA
     * +-------------++-------------+
     * |             ||             |
     * |  left-top   ||  mid-top    |
     * |             ||             |
     * +-------------++-------------+
     * |             ||             |
     * | left-bottom || mid-bottom  |
     * |             ||             |
     * +-------------++-------------+
     */
    test('should render correct drop zones when dragging horizontally', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.mid-top'});

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left-top', {align: 'left', ratio: .25})
        .addPart('part.left-bottom', {align: 'bottom', relativeTo: 'part.left-top', ratio: .25}) // split left part
        .addPart('part.mid-bottom', {align: 'bottom', relativeTo: 'part.mid-top', ratio: .25}) // split main area
        .addView('view.101', {partId: 'part.left-top', activateView: true})
        .addView('view.102', {partId: 'part.left-top'})
        .addView('view.103', {partId: 'part.left-bottom', activateView: true})
        .addView('view.104', {partId: 'part.mid-top', activateView: true})
        .addView('view.105', {partId: 'part.mid-bottom', activateView: true}),
      );

      const tab = appPO.view({viewId: 'view.101'}).tab;
      const mainGrid = appPO.grid({grid: 'main'});
      const mainAreaPart = appPO.part({partId: MAIN_AREA});
      const leftTopPart = appPO.part({partId: 'part.left-top'});
      const leftTopPartBounds = await appPO.part({partId: 'part.left-top'}).getBoundingBox('content');
      const midTopPart = appPO.part({partId: 'part.mid-top'});
      const midTopPartBounds = await appPO.part({partId: 'part.mid-top'}).getBoundingBox('content');

      const dragHandle = await tab.startDrag();

      await test.step('drag to the vertical center of the left-top part, 10px to the right of its left edge', async () => {
        await dragHandle.dragTo({x: 10, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the right, 75px to the right of the left edge of the left-top part', async () => {
        await dragHandle.dragTo({x: 75, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toEqual('west');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the right, to the middle of the left-top part', async () => {
        await dragHandle.dragTo({x: leftTopPartBounds.hcenter, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toEqual('center');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the right, 25px to the left of the right edge of the left-top part', async () => {
        await dragHandle.dragTo({x: leftTopPartBounds.right - 25, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toEqual('east');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the right, 25px to the right of the left main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.x + 25, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('west');
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the right, 200px to the right of the left main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.x + 200, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the right, to the middle of the main area', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.hcenter, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the right, 200px to the left of the right main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.right - 200, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the right, 75px to the left of the right main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.right - 75, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('east');
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the right, 25px to the left of the right main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.right - 25, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('east');
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the left, 75px to the left of the right main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.right - 75, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('east');
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the left, 200px to the left of the right main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.right - 200, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toEqual('east');
      });

      await test.step('drag to the left, to the middle of the main area', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.hcenter, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toEqual('center');
      });

      await test.step('drag to the left, 200px to the right of the left main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.x + 200, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toEqual('west');
      });

      await test.step('drag to the left, 25px to the right of the left main area edge', async () => {
        await dragHandle.dragTo({x: midTopPartBounds.x + 25, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('west');
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the left, 25px to the left of the right edge of the left-top part', async () => {
        await dragHandle.dragTo({x: leftTopPartBounds.right - 25, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toEqual('east');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the left, to the middle of the left-top part', async () => {
        await dragHandle.dragTo({x: leftTopPartBounds.hcenter, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toEqual('center');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the left, 75px to the right of the left edge of the left-top part', async () => {
        await dragHandle.dragTo({x: 75, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
        await expect.poll(() => leftTopPart.getActiveDropZone()).toEqual('west');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the left, 10px to the right of the left edge of the left-top part', async () => {
        await dragHandle.dragTo({x: 10, y: leftTopPartBounds.vcenter});
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('west');
        await expect.poll(() => leftTopPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => midTopPart.getActiveDropZone()).toBeNull();
      });
    });

    /**
     * This test operates on the following layout, dragging a view tab
     * in the right part from the top to the bottom and back.
     *
     *
     *      MAIN AREA
     * +--------++-------+
     * |        |        |
     * |  left  |  right |
     * |        |        |
     * +--------+--------+
     */
    test('should render correct drop zones when dragging vertically', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.left'});

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.right', {align: 'right', relativeTo: 'part.left'})
        .addView('view.101', {partId: 'part.left', activateView: true})
        .addView('view.102', {partId: 'part.right', activateView: true})
        .addView('view.103', {partId: 'part.right'}),
      );

      const tab = appPO.view({viewId: 'view.101'}).tab;
      const mainAreaPart = appPO.part({partId: MAIN_AREA});
      const rightPart = appPO.part({partId: 'part.right'});
      const viewBounds = await appPO.view({viewId: 'view.102'}).getBoundingBox();
      const mainGrid = appPO.grid({grid: 'main'});

      const dragHandle = await tab.startDrag();

      await test.step('drag to the horizontal center of the right part, 10px to the bottom of its top edge', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.top + 10});
        await expect.poll(() => rightPart.getActiveDropZone()).toEqual('north');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the bottom, to the middle of the right part', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.vcenter});
        await expect.poll(() => rightPart.getActiveDropZone()).toEqual('center');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the bottom, 125px to the top of the bottom edge', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.bottom - 125});
        await expect.poll(() => rightPart.getActiveDropZone()).toEqual('south');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the bottom, 75px to the top of the bottom edge', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.bottom - 75});
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('south');
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the bottom, 25px to the top of the bottom edge', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.bottom - 25});
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toEqual('south');
      });

      await test.step('drag to the top, 75px to the top of the bottom edge', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.bottom - 75});
        await expect.poll(() => rightPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toEqual('south');
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the top, 125px to the top of the bottom edge', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.bottom - 125});
        await expect.poll(() => rightPart.getActiveDropZone()).toEqual('south');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the top, to the middle of the right part', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.vcenter});
        await expect.poll(() => rightPart.getActiveDropZone()).toEqual('center');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });

      await test.step('drag to the top, 10px to the bottom of the top edge of the right part', async () => {
        await dragHandle.dragTo({x: viewBounds.hcenter, y: viewBounds.top + 10});
        await expect.poll(() => rightPart.getActiveDropZone()).toEqual('north');
        await expect.poll(() => mainAreaPart.getActiveDropZone()).toBeNull();
        await expect.poll(() => mainGrid.getActiveDropZone()).toBeNull();
      });
    });
  });
});
