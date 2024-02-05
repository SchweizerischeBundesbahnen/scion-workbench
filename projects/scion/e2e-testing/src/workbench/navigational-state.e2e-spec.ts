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

test.describe('Navigational State', () => {

  test.describe('ActivatedRoute.data', () => {

    test('should emit `undefined` when not passing state to the view navigation', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-view');
      await routerPage.enterTarget('view.100');
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data emitted undefined as state
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ActivatedRouteDataChange/})).toEqual([
        `[ActivatedRouteDataChange] [viewId=view.100, state=undefined]`,
      ]);
    });

    test('should emit the state as passed to the view navigation', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-view');
      await routerPage.enterNavigationalState({'some': 'state'});
      await routerPage.enterTarget('view.100');
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data emitted the passed state
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ActivatedRouteDataChange/})).toEqual([
        `[ActivatedRouteDataChange] [viewId=view.100, state={"some":"state"}]`,
      ]);
    });

    test('should not restore navigational state after page reload', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-view');
      await routerPage.enterNavigationalState({'some': 'state'});
      await routerPage.enterTarget('view.100');
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data emitted the passed state
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ActivatedRouteDataChange/})).toEqual([
        `[ActivatedRouteDataChange] [viewId=view.100, state={"some":"state"}]`,
      ]);
      consoleLogs.clear();

      await appPO.reload();

      // expect ActivatedRoute.data emitting undefined as state after page reload
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ActivatedRouteDataChange/})).toEqual([
        `[ActivatedRouteDataChange] [viewId=view.100, state=undefined]`,
      ]);
    });

    test('should not emit when updating matrix params of a view ', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

      // navigate to the test view
      await routerPage.enterPath('test-view');
      await routerPage.enterTarget('blank');
      await routerPage.enterMatrixParams({'param': 'value 1'});
      await routerPage.enterTarget('view.100');
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data emitted undefined as state
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ActivatedRouteDataChange/})).toEqual([
        `[ActivatedRouteDataChange] [viewId=view.100, state=undefined]`,
      ]);
      consoleLogs.clear();

      // update matrix param
      await routerPage.view.tab.click();
      await routerPage.enterMatrixParams({'param': 'value 2'});
      await routerPage.enterTarget('view.100');
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data not to emit
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ActivatedRouteDataChange/})).toEqual([]);
    });
  });
});
