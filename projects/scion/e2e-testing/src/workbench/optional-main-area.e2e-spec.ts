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
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {LayoutPagePO} from './page-object/layout-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {BinaryMTreeNode, MPart} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('Perspective without main area', () => {

  test('should open new view in the active part of the contextual view when navigating via router link', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register angular routes
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    // named views
    const namedViewLeft = 'viewLeft';
    const namedViewRight = 'viewRight';
    await layoutPagePO.registerRoute({path: '', component: 'router-page', outlet: namedViewLeft});
    await layoutPagePO.registerRoute({path: '', component: 'view-page', outlet: namedViewRight});
    // unnamed views
    await layoutPagePO.registerRoute({path: 'testee', component: 'view-page'});
    await layoutPagePO.viewTab.close();

    // Register new perspective.
    const perspectivePagePO = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePagePO.registerPerspective({
      id: 'test',
      data: {
        label: 'test',
      },
      parts: [{id: 'left'}, {id: 'right', align: 'right'}],
      views: [{id: namedViewLeft, partId: 'left', activateView: true}, {id: namedViewRight, partId: 'right', activateView: true}],
    });
    await perspectivePagePO.viewTab.close();

    // Switch to the newly created perspective.
    await appPO.header.perspectiveToggleButton({perspectiveId: 'test'}).click();

    // Expect layout to match the perspective definition.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: namedViewLeft}], activeViewId: namedViewLeft}),
          child2: new MPart({id: 'right', views: [{id: namedViewRight}], activeViewId: namedViewRight}),
        }),
      },
    });

    // Open new view via workbench router link.
    const routerPagePO = new RouterPagePO(appPO, namedViewLeft);
    await routerPagePO.enterPath('/testee');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouterLink();

    // Expect new view to be present.
    const testee = appPO.view({cssClass: 'testee'});
    await expect(await testee.viewTab.isPresent()).toBe(true);
    const testeeViewId = await testee.getViewId();

    // Expect new view to be opened in active part of the contextual view i.e. left
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'left', views: [{id: namedViewLeft}, {id: testeeViewId}], activeViewId: testeeViewId}),
          child2: new MPart({id: 'right', views: [{id: namedViewRight}], activeViewId: namedViewRight}),
        }),
      },
    });
  });
});
