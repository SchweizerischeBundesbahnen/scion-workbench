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

    // Navigate view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      data: {data1: 'data 1'},
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data1: 'data 1'});
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate view again with different data.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      data: {data2: 'data 2'},
      cssClass: 'testee',
    });
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data2: 'data 2'});
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate view again without data.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee',
    });
    await expect.poll(() => viewPage.getNavigationData()).toEqual({});
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate view again with different data.
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

  test('should maintain data when moving view to other window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      activate: false,
      cssClass: 'testee-1',
      data: {data: 'data-1'},
    });

    // Open view 2
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      activate: false,
      cssClass: 'testee-2',
      data: {data: 'data-2'},
    });

    // Open view 3
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      activate: false,
      cssClass: 'testee-3',
      data: {data: 'data-3'},
    });

    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const viewPage3 = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    // Move view 1 to new window.
    const newAppPO = await viewPage1.view.tab.moveToNewWindow();
    const newViewPage1 = new ViewPagePO(newAppPO, {cssClass: 'testee-1'});
    // Expect navigation data be retained.
    await expect.poll(() => newViewPage1.getNavigationData()).toEqual({data: 'data-1'});

    // Move view 2 to the window.
    await viewPage2.view.tab.moveTo(await newViewPage1.view.part.getPartId(), {workbenchId: await newAppPO.getWorkbenchId()});
    const newViewPage2 = new ViewPagePO(newAppPO, {cssClass: 'testee-2'});
    // Expect navigation data be retained.
    await expect.poll(() => newViewPage2.getNavigationData()).toEqual({data: 'data-2'});

    // Move view 3 to the window in a new part.
    await viewPage3.view.tab.moveTo(await newViewPage1.view.part.getPartId(), {region: 'east', workbenchId: await newAppPO.getWorkbenchId()});
    const newViewPage3 = new ViewPagePO(newAppPO, {cssClass: 'testee-3'});
    // Expect navigation data be retained.
    await expect.poll(() => newViewPage3.getNavigationData()).toEqual({data: 'data-3'});
  });

  test('should not affect view resolution', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Navigate view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      data: {data1: 'data 1'},
      target: 'view.100',
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data1: 'data 1'});
    await expect(appPO.views()).toHaveCount(2);

    // Navigate view again with different data.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      data: {data2: 'data 2'},
    });
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data2: 'data 2'});
    await expect(appPO.views()).toHaveCount(2);

    // Navigate view again without data.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view']);
    await expect.poll(() => viewPage.getNavigationData()).toEqual({});
    await expect(appPO.views()).toHaveCount(2);

    // Navigate view again with different data.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      data: {data3: 'data 3'},
    });
    await expect.poll(() => viewPage.getNavigationData()).toEqual({data3: 'data 3'});
    await expect(appPO.views()).toHaveCount(2);
  });
});
