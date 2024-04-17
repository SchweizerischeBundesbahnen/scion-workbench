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
import {MAIN_AREA} from '../workbench.model';
import {ViewPagePO} from './page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('Workbench Perspective Storage', () => {

  test('should restore workbench grid from storage', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part and view to the workbench grid
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addView('view.101', {partId: 'left'})
      .addView('view.102', {partId: 'left', activateView: true, activatePart: true})
      .addView('view.103', {partId: activePartId, activateView: true})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      .navigateView('view.103', ['test-view']),
    );

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewPagePO(appPO, {viewId: 'view.102'});
    const viewPage3 = new ViewPagePO(appPO, {viewId: 'view.103'});

    // Reopen the page
    await appPO.reload();

    // Expect perspective to be restored from the storage
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.101'}, {id: 'view.102'}],
            activeViewId: 'view.102',
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
        activePartId: 'left',
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.103'}],
          activeViewId: 'view.103',
        }),
      },
    });

    await expectView(viewPage1).toBeInactive();
    await expectView(viewPage2).toBeActive();
    await expectView(viewPage3).toBeActive();

    // Close view
    await viewPage2.view.tab.close();

    // Reopen the page
    await appPO.reload();

    // Expect perspective to be restored from the storage
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
        activePartId: 'left',
      },
      mainAreaGrid: {
        root: new MPart({
          views: [{id: 'view.103'}],
          activeViewId: 'view.103',
        }),
      },
    });
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).not.toBeAttached();
    await expectView(viewPage3).toBeActive();
  });

  test('should not set the initial perspective as the active perspective in storage and window', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await expect.poll(() => appPO.getWindowName()).toEqual('');
    await expect.poll(() => appPO.getLocalStorageItem('scion.workbench.perspective')).toBeNull();
  });

  test('should select the initial perspective from storage', async ({appPO}) => {
    await appPO.navigateTo({
      microfrontendSupport: false,
      perspectives: ['testee-1', 'testee-2', 'testee-3'],
      localStorage: {
        'scion.workbench.perspective': 'testee-2',
      },
    });

    await expect.poll(() => appPO.header.perspectiveToggleButton({perspectiveId: 'testee-2'}).isActive()).toBe(true);
  });
});
