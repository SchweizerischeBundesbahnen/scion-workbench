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

    const view1PO = appPO.view({cssClass: 'e2e-test-view-1'});
    const view2PO = appPO.view({cssClass: 'e2e-test-view-2'});

    // Add part to the workbench grid
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});

    // Add view-1 to the left part
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterBlankPartId('left');
    await routerPagePO.clickNavigate();

    // Expect view-1 to be active
    await expect(await view1PO.isActive()).toBe(true);

    // Add view-2 to the left part
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterBlankPartId('left');
    await routerPagePO.clickNavigate();

    // Expect view-2 to be active
    await expect(await view1PO.isActive()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // Activate view-1
    await view1PO.viewTab.click();
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // Close view-1
    await view1PO.viewTab.close();
    await expect(await view1PO.isPresent()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expect(await view1PO.isActive()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-2 not to be present
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isPresent()).toBe(false);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect no test views to be present
    await expect(await view1PO.isPresent()).toBe(false);
    await expect(await view2PO.isPresent()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be present
    await expect(await view1PO.isPresent()).toBe(true);
    await expect(await view2PO.isPresent()).toBe(false);
    await expect(await view1PO.isActive()).toBe(true);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 and view-2 to be present
    await expect(await view1PO.viewTab.isPresent()).toBe(true);
    await expect(await view2PO.isPresent()).toBe(true);
    await expect(await view1PO.isActive()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be closed
    await expect(await view1PO.isPresent()).toBe(false);
    await expect(await view2PO.isPresent()).toBe(true);
    await expect(await view2PO.isActive()).toBe(true);
  });

  test('should put main-area grid-related navigations into browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const view1PO = appPO.view({cssClass: 'e2e-test-view-1'});
    const view2PO = appPO.view({cssClass: 'e2e-test-view-2'});

    // Add view-1
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.checkActivate(false);
    await routerPagePO.enterInsertionIndex('end');
    await routerPagePO.clickNavigate();

    // Add view-2
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view-2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.checkActivate(false);
    await routerPagePO.enterInsertionIndex('end');
    await routerPagePO.clickNavigate();

    // Activate view-1
    await view1PO.viewTab.click();
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // Activate view-2
    await view2PO.viewTab.click();
    await expect(await view1PO.isActive()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // Activate view-1
    await view1PO.viewTab.click();
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // Close view-1
    await view1PO.viewTab.close();
    await expect(await view1PO.isPresent()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expect(await view1PO.isActive()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-2 to be active
    await expect(await view1PO.isActive()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expect(await view1PO.isActive()).toBe(true);
    await expect(await view2PO.isActive()).toBe(false);

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expect(await view1PO.isPresent()).toBe(false);
    await expect(await view2PO.isActive()).toBe(true);
  });

  test.describe('Standalone Component', () => {

    test('should display standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/component');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({loadComponent: () => component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/load-component');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/load-children/module');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/load-children/routes');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/standalone-view-test-page/children');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const standaloneViewTestPagePO = new StandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await standaloneViewTestPagePO.isVisible()).toBe(true);
    });
  });

  test.describe('Non-Standalone Component', () => {

    test('should display non-standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/non-standalone-view-test-page/component');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const nonStandaloneViewTestPagePO = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display non-standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/non-standalone-view-test-page/load-children/module');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const nonStandaloneViewTestPagePO = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);
    });

    test('should display non-standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath('test-pages/non-standalone-view-test-page/children');
      await routerPagePO.enterMatrixParams({cssClass: 'e2e-test-view'});
      await routerPagePO.enterTarget(routerPagePO.viewId);
      await routerPagePO.clickNavigate();

      const nonStandaloneViewTestPagePO = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'e2e-test-view'});
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);

      await appPO.navigateBack();
      await expect(await routerPagePO.isVisible()).toBe(true);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(false);

      await appPO.navigateForward();
      await expect(await routerPagePO.isVisible()).toBe(false);
      await expect(await nonStandaloneViewTestPagePO.isVisible()).toBe(true);
    });
  });
});
