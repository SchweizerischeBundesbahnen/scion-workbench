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
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data emitted undefined as state
      const testeeViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
      await expect(await consoleLogs.get({severity: 'debug', filter: /ActivatedRouteDataChange/, consume: true})).toEqual([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state=undefined]`,
      ]);
    });

    test('should emit the state as passed to the view navigation', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-view');
      await routerPage.enterNavigationalState({'some': 'state'});
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data emitted the passed state
      const testeeViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
      await expect(await consoleLogs.get({severity: 'debug', filter: /ActivatedRouteDataChange/, consume: true})).toEqual([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state={"some":"state"}]`,
      ]);
    });

    test('should not restore navigational state after page reload', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // navigate to the test view
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-view');
      await routerPage.enterNavigationalState({'some': 'state'});
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data emitted the passed state
      const testeeViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
      await expect(await consoleLogs.get({severity: 'debug', filter: /ActivatedRouteDataChange/, consume: true})).toEqual([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state={"some":"state"}]`,
      ]);

      await appPO.reload();
      // expect ActivatedRoute.data emitting undefined as state after page reload
      await expect(await consoleLogs.get({severity: 'debug', filter: /ActivatedRouteDataChange/, consume: true})).toEqual([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state=undefined]`,
      ]);
    });

    test('should not emit when updating matrix params of a view ', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

      // navigate to the test view
      await routerPage.enterPath('test-view');
      await routerPage.enterTarget('blank');
      await routerPage.enterMatrixParams({'param': 'value 1'});
      await routerPage.clickNavigate();

      const testeeViewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();

      // expect ActivatedRoute.data emitted undefined as state
      await expect(await consoleLogs.get({severity: 'debug', filter: /ActivatedRouteDataChange/, consume: true})).toEqual([
        `[ActivatedRouteDataChange] [viewId=${testeeViewId}, state=undefined]`,
      ]);

      // update matrix param
      await routerPage.viewTab.click();
      await routerPage.enterMatrixParams({'param': 'value 2'});
      await routerPage.enterTarget(testeeViewId);
      await routerPage.clickNavigate();

      // expect ActivatedRoute.data not to emit
      await expect(await consoleLogs.get({severity: 'debug', filter: /ActivatedRouteDataChange/, consume: true})).toEqual([]);
    });
  });
});
