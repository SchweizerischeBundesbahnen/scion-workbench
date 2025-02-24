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
import {MAIN_AREA} from '../workbench.model';
import {expect} from '@playwright/test';

test.describe('Workbench', () => {

  test('should minimize and maximize activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.left', {relativeTo: MAIN_AREA, align: 'left', ratio: .2})
      .addPart('part.right', {relativeTo: MAIN_AREA, align: 'right', ratio: .2})
      .addView('view.100', {partId: 'part.left'})
      .navigateView('view.100', ['test-view'])
      .navigatePart('part.right', ['test-part'])
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'search', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-1', ['test-part'])
      .navigatePart('part.activity-2', ['test-part']),
    );

    // Open activity.1
    const activity1 = appPO.activity({activityId: 'activity.1'});
    await activity1.toggle();

    // Open activity.2
    const activity2 = appPO.activity({activityId: 'activity.2'});
    await activity2.toggle();

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1', icon: 'folder', label: 'testee-1'}],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [{id: 'activity.2', icon: 'search', label: 'testee-2'}],
            activeActivityId: 'activity.3',
          },
          rightTop: {activities: []},
          rightBottom: {activities: []},
          bottomLeft: {activities: []},
          bottomRight: {activities: []},
        },
        panels: {
          left: {},
          right: {},
          bottom: {},
        },
      },
    });

    // // Open view 1 in main area.
    // const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    // await routerPage.navigate(['test-view'], {
    //   target: 'blank',
    //   activate: false,
    //   cssClass: 'view-1',
    // });
    //
    // // Open view 2 in main area.
    // await routerPage.navigate(['test-view'], {
    //   target: 'blank',
    //   activate: false,
    //   cssClass: 'view-2',
    // });
    // await routerPage.view.tab.close();
    //
    // // Move view 2 to the right of view 1.
    // const view1 = appPO.view({cssClass: 'view-1'});
    // const view2 = appPO.view({cssClass: 'view-2'});
    // const dragHandle = await view2.tab.startDrag();
    // await dragHandle.dragToPart(await view1.part.getPartId(), {region: 'east'});
    // await dragHandle.drop();
    //
    // const viewId1 = await view1.getViewId();
    // const viewId2 = await view2.getViewId();

    // Expect the workbench layout.
    // await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
    //   activityLayout: {
    //     toolbars: {
    //       leftTop: {
    //         activities: [{id: 'activity.1', icon: 'folder', label: 'testee-1'}],
    //         activeActivityId: 'activity.1',
    //       },
    //       leftBottom: {
    //         activities: [{id: 'activity.2', icon: 'search', label: 'testee-2'}],
    //         activeActivityId: 'activity.3',
    //       },
    //       rightTop: {activities: []},
    //       rightBottom: {activities: []},
    //       bottomLeft: {activities: []},
    //       bottomRight: {activities: []},
    //     },
    //     panels: {
    //       left: {},
    //       right: {},
    //       bottom: {},
    //     },
    //     activeActivitiesSnapshot: [],
    //   },
    // mainGrid: {
    //   root: new MTreeNode({
    //     direction: 'row',
    //     ratio: .2,
    //     child1: new MPart({
    //       id: 'part.left',
    //       views: [{id: 'view.100'}],
    //       activeViewId: 'view.100',
    //     }),
    //     child2: new MTreeNode({
    //       direction: 'row',
    //       ratio: .8,
    //       child1: new MPart({
    //         id: MAIN_AREA,
    //       }),
    //       child2: new MPart({
    //         id: 'part.right',
    //       }),
    //     }),
    //   }),
    // },
    // mainAreaGrid: {
    //   root: new MTreeNode({
    //     direction: 'row',
    //     ratio: .5,
    //     child1: new MPart({
    //       views: [{id: viewId1}],
    //       activeViewId: viewId1,
    //     }),
    //     child2: new MPart({
    //       views: [{id: viewId2}],
    //       activeViewId: viewId2,
    //     }),
    //   }),
    // },
    // });

    // // Maximize the main area.
    // await view2.tab.dblclick();
    // await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
    //   mainGrid: {
    //     root: new MTreeNode({
    //       direction: 'row',
    //       ratio: .5,
    //       child1: new MPart({
    //         views: [{id: viewId1}],
    //         activeViewId: viewId1,
    //       }),
    //       child2: new MPart({
    //         views: [{id: viewId2}],
    //         activeViewId: viewId2,
    //       }),
    //     }),
    //   },
    // });
    //
    // // Restore the main area.
    // await view2.tab.dblclick();
    // await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
    //   mainGrid: {
    //     root: new MTreeNode({
    //       direction: 'row',
    //       ratio: .2,
    //       child1: new MPart({
    //         id: 'part.left',
    //         views: [{id: 'view.100'}],
    //         activeViewId: 'view.100',
    //       }),
    //       child2: new MTreeNode({
    //         direction: 'row',
    //         ratio: .8,
    //         child1: new MPart({
    //           id: MAIN_AREA,
    //         }),
    //         child2: new MPart({
    //           id: 'part.right',
    //         }),
    //       }),
    //     }),
    //   },
    //   mainAreaGrid: {
    //     root: new MTreeNode({
    //       direction: 'row',
    //       ratio: .5,
    //       child1: new MPart({
    //         views: [{id: viewId1}],
    //         activeViewId: viewId1,
    //       }),
    //       child2: new MPart({
    //         views: [{id: viewId2}],
    //         activeViewId: viewId2,
    //       }),
    //     }),
    //   },
    // });
  });
});
