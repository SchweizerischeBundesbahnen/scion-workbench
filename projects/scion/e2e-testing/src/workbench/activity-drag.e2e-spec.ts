/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';

test.describe('Activity Drag', () => {

  test('should allow dragging activity view to new part of same activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.101', {partId: 'part.activity-1'})
      .addView('view.102', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}, {id: 'view.102'}],
            activeViewId: 'view.101',
          }),
        },
      },
    });

    // Move view to a new part in the east.
    const testView = appPO.view({viewId: 'view.102'});
    const dragHandle = await testView.tab.startDrag();
    await dragHandle.dragToPart('part.activity-1', {region: 'east'});
    await dragHandle.drop();

    // Expect view to be moved to a new part in the east.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              views: [{id: 'view.101'}],
              activeViewId: 'view.101',
            }),
            child2: new MPart({
              views: [{id: 'view.102'}],
              activeViewId: 'view.102',
            }),
          }),
        },
      },
    });
  });

  test('should allow dragging activity view to part bar of same activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.101', {partId: 'part.activity-1'})
      .addView('view.102', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}, {id: 'view.102'}],
            activeViewId: 'view.101',
          }),
        },
      },
    });

    // Move view to part bar of same activity.
    const testView = appPO.view({viewId: 'view.102'});
    const dropTarget = await appPO.view({viewId: 'view.101'}).tab.getBoundingBox();
    const dragHandle = await testView.tab.startDrag();
    await dragHandle.dragTo({x: dropTarget.left, y: dropTarget.vcenter});
    await dragHandle.drop();

    // Expect view to be moved.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.102'}, {id: 'view.101'}],
            activeViewId: 'view.102',
          }),
        },
      },
    });
  });

  test('should NOT allow dragging activity view to another activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addView('view.101', {partId: 'part.activity-1'})
      .addView('view.201', {partId: 'part.activity-2'})
      .activatePart('part.activity-1')
      .activatePart('part.activity-2'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.2': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });

    // Try moving view to another activity.
    const testView = appPO.view({viewId: 'view.101'});
    const dragHandle = await testView.tab.startDrag();
    await dragHandle.dragToPart('part.activity-2', {region: 'center', orElse: false});
    await dragHandle.drop();

    // Expect view not to be moved.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.2': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });
  });

  test('should NOT allow dragging activity view to part bar of another activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addView('view.101', {partId: 'part.activity-1'})
      .addView('view.201', {partId: 'part.activity-2'})
      .activatePart('part.activity-1')
      .activatePart('part.activity-2'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.2': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });

    // Try moving view to part bar of another activity.
    const testView = appPO.view({viewId: 'view.101'});
    const dropTarget = await appPO.view({viewId: 'view.201'}).tab.getBoundingBox();
    const dragHandle = await testView.tab.startDrag();
    await dragHandle.dragTo({x: dropTarget.hcenter, y: dropTarget.vcenter});
    await dragHandle.drop();

    // Expect view not to be moved.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.2': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });
  });

  test('should NOT allow dragging activity view to desktop', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.101', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
      },
    });

    // Try moving view to desktop.
    const testView = appPO.view({viewId: 'view.101'});
    const dragHandle = await testView.tab.startDrag();
    await dragHandle.dragToPart(MAIN_AREA, {region: 'center', orElse: false});
    await dragHandle.drop();

    // Expect view not to be moved.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
      },
    });
  });

  test('should NOT allow dragging view to activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main'})
      .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.201', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });

    // Try moving view to activity.
    const testView = appPO.view({viewId: 'view.101'});
    const dragHandle = await testView.tab.startDrag();
    await dragHandle.dragToPart('part.activity-1', {region: 'center', orElse: false});
    await dragHandle.drop();

    // Expect view not to be moved.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });
  });

  test('should NOT allow dragging view to part bar of activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main'})
      .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.201', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });

    // Try moving view to part bar of activity.
    const testView = appPO.view({viewId: 'view.101'});
    const dropTarget = await appPO.view({viewId: 'view.201'}).tab.getBoundingBox();
    const dragHandle = await testView.tab.startDrag();
    await dragHandle.dragTo({x: dropTarget.hcenter, y: dropTarget.vcenter});
    await dragHandle.drop();

    // Expect view not to be moved.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        'activity.1': {
          root: new MPart({
            views: [{id: 'view.201'}],
            activeViewId: 'view.201',
          }),
        },
      },
    });
  });
});
