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
import {RouterPagePO} from './page-object/router-page.po';
import {StandaloneViewTestPagePO} from './page-object/test-pages/standalone-view-test-page.po';
import {NonStandaloneViewTestPagePO} from './page-object/test-pages/non-standalone-view-test-page.po';

test.describe('Browser Reload', () => {

  test.describe('Standalone Component', () => {

    test('should display standalone view component after browser reload ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/component');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser reload ({loadComponent: () => component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/load-component');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser reload ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/load-children/module');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser reload ({loadChildren: () => routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/load-children/routes');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser reload ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/children');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });
  });

  test.describe('Non-Standalone Component', () => {

    test('should display non-standalone view component after browser reload ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/non-standalone-view-test-page/component');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const nonStandaloneViewTestPagePO = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display non-standalone view component after browser reload ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/non-standalone-view-test-page/load-children/module');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const nonStandaloneViewTestPagePO = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display non-standalone view component after browser reload ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/non-standalone-view-test-page/children');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.clickNavigate();

      const nonStandaloneViewTestPagePO = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.reload();
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);
    });
  });
});
