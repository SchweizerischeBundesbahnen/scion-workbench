/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {MAIN_AREA} from '../workbench.model';
import {RouterPagePO} from './page-object/router-page.po';
import {expect} from '@playwright/test';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('Workbench', () => {

  test('should allow maximizing the main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .2})
      .addView('view.100', {partId: 'left'})
      .navigateView('view.100', ['test-view']),
    );

    // Open view 1 in main area.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      activate: false,
      cssClass: 'view-1'
    });

    // Open view 2 in main area.
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      activate: false,
      cssClass: 'view-2'
    });
    await routerPage.view.tab.close();

    // Move view 2 to the right of view 1.
    const view1 = appPO.view({cssClass: 'view-1'});
    const view2 = appPO.view({cssClass: 'view-2'});
    await view2.tab.dragTo({partId: await view1.part.getPartId(), region: 'east'});

    const viewId1 = await view1.getViewId();
    const viewId2 = await view2.getViewId();

    // Expect the workbench layout.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .2,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            views: [{id: viewId1}],
            activeViewId: viewId1,
          }),
          child2: new MPart({
            views: [{id: viewId2}],
            activeViewId: viewId2,
          }),
        }),
      },
    });

    // Maximize the main area.
    await view2.tab.dblclick();
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            views: [{id: viewId1}],
            activeViewId: viewId1,
          }),
          child2: new MPart({
            views: [{id: viewId2}],
            activeViewId: viewId2,
          }),
        }),
      },
    });

    // Restore the main area.
    await view2.tab.dblclick();
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .2,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            views: [{id: viewId1}],
            activeViewId: viewId1,
          }),
          child2: new MPart({
            views: [{id: viewId2}],
            activeViewId: viewId2,
          }),
        }),
      },
    });
  });
});
