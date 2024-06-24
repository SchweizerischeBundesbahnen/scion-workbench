/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Navigational Data', () => {

  test('should pass data (WorkbenchRouter.navigate)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      data: {some: 'data'},
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getNavigationData()).toEqual({some: 'data'});
  });

  test('should pass data (WorkbenchLayout.navigateView)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {align: 'right'})
      .addView('testee', {partId: 'right', activateView: true, cssClass: 'testee'})
      .navigateView('testee', ['test-view'], {data: {some: 'data'}}),
    );

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getNavigationData()).toEqual({some: 'data'});
  });

  test('should preserve data type of data', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      data: {
        data1: 'value',
        data2: '<number>0</number>',
        data3: '<number>2</number>',
        data4: '<boolean>true</boolean>',
        data5: '<boolean>false</boolean>',
        data6: '<null>',
        data7: '<undefined>',
      },
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getNavigationData()).toEqual({
      data1: 'value',
      data2: '0 [number]',
      data3: '2 [number]',
      data4: 'true [boolean]',
      data5: 'false [boolean]',
      data6: 'null [null]',
    });
  });

  test('should replace/discard data when navigating view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Navigate view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      data: {data1: 'data 1'},
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data1: 'data 1'});
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate view again with a different data
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      data: {data2: 'data 2'},
      cssClass: 'testee',
    });
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data2: 'data 2'});
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate view again without data
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee',
    });
    await expect.poll(() => viewPage.getNavigationData()).toEqual({});
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate view again with a different data
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      data: {data3: 'data 3'},
      cssClass: 'testee',
    });
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data3: 'data 3'});
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);
  });

  test('should retain data when reloading the application', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      data: {some: 'data'},
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getNavigationData()).toEqual({some: 'data'});

    await appPO.reload();
    await expect.poll(() => viewPage.getNavigationData()).toEqual({some: 'data'});
  });
});
