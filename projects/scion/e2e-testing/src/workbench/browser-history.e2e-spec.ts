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
import {LayoutPagePO} from './page-object/layout-page.po';
import {StandaloneViewTestPagePO} from './page-object/test-pages/standalone-view-test-page.po';
import {NonStandaloneViewTestPagePO} from './page-object/test-pages/non-standalone-view-test-page.po';
import {MAIN_AREA} from '../workbench.model';

test.describe('Browser History', () => {

  test('should put workbench grid-related navigations into browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const view1 = appPO.view({cssClass: 'e2e-test-view-1'});
    const view2 = appPO.view({cssClass: 'e2e-test-view-2'});

    // Add part to the workbench grid
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});

    // Add view-1 to the left part
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterBlankPartId('left');
    await routerPage.clickNavigate();

    // Expect view-1 to be active
    await expect(await view1.isActive()).toBe(true);

    // Add view-2 to the left part
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterBlankPartId('left');
    await routerPage.clickNavigate();

    // Expect view-2 to be active
    await expect(await view1.isActive()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // Activate view-1
    await view1.viewTab.click();
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // Close view-1
    await view1.viewTab.close();
    await expect(await view1.isPresent()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expect(await view1.isActive()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-2 not to be present
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isPresent()).toBe(false);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect no test views to be present
    await expect(await view1.isPresent()).toBe(false);
    await expect(await view2.isPresent()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be present
    await expect(await view1.isPresent()).toBe(true);
    await expect(await view2.isPresent()).toBe(false);
    await expect(await view1.isActive()).toBe(true);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 and view-2 to be present
    await expect(await view1.viewTab.isPresent()).toBe(true);
    await expect(await view2.isPresent()).toBe(true);
    await expect(await view1.isActive()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be closed
    await expect(await view1.isPresent()).toBe(false);
    await expect(await view2.isPresent()).toBe(true);
    await expect(await view2.isActive()).toBe(true);
  });

  test('should put main-area grid-related navigations into browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const view1 = appPO.view({cssClass: 'e2e-test-view-1'});
    const view2 = appPO.view({cssClass: 'e2e-test-view-2'});

    // Add view-1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPage.enterTarget('blank');
    await routerPage.checkActivate(false);
    await routerPage.enterInsertionIndex('end');
    await routerPage.clickNavigate();

    // Add view-2
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPage.enterTarget('blank');
    await routerPage.checkActivate(false);
    await routerPage.enterInsertionIndex('end');
    await routerPage.clickNavigate();

    // Activate view-1
    await view1.viewTab.click();
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // Activate view-2
    await view2.viewTab.click();
    await expect(await view1.isActive()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // Activate view-1
    await view1.viewTab.click();
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // Close view-1
    await view1.viewTab.close();
    await expect(await view1.isPresent()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expect(await view1.isActive()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-2 to be active
    await expect(await view1.isActive()).toBe(false);
    await expect(await view2.isActive()).toBe(true);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expect(await view1.isActive()).toBe(true);
    await expect(await view2.isActive()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expect(await view1.isPresent()).toBe(false);
    await expect(await view2.isActive()).toBe(true);
  });

  test.describe('Standalone Component', () => {

    test('should display standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/component');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await standaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({loadComponent: () => component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-component');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await standaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-children/module');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await standaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-children/routes');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await standaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/children');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await standaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await standaloneViewTestPage.isVisible()).toBe(true);
    });
  });

  test.describe('Non-Standalone Component', () => {

    test('should display non-standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/component');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(true);
    });

    test('should display non-standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/load-children/module');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(true);
    });

    test('should display non-standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/children');
      await routerPage.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPage.enterTarget(routerPage.viewId);
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPage.isVisible()).toBe(true);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPage.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPage.isVisible()).toBe(true);
    });
  });
});
