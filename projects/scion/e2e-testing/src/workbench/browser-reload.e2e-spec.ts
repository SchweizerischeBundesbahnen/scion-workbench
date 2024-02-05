/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {StandaloneViewTestPagePO} from './page-object/test-pages/standalone-view-test-page.po';
import {NonStandaloneViewTestPagePO} from './page-object/test-pages/non-standalone-view-test-page.po';
import {expectView} from '../matcher/view-matcher';

test.describe('Browser Reload', () => {

  test.describe('Standalone Component', () => {

    test('should display standalone view component after browser reload ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/component');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser reload ({loadComponent: () => component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-component');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser reload ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-children/module');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser reload ({loadChildren: () => routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-children/routes');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser reload ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/children');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(standaloneViewTestPage).toBeActive();
    });
  });

  test.describe('Non-Standalone Component', () => {

    test('should display non-standalone view component after browser reload ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/component');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });

    test('should display non-standalone view component after browser reload ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/load-children/module');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });

    test('should display non-standalone view component after browser reload ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/children');
      await routerPage.enterTarget('view.101');
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {viewId: 'view.101'});
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.reload();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });
  });
});
