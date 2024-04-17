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
import {MAIN_AREA} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Browser History', () => {

  test('should put workbench grid-related navigations into browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part to the workbench grid
    await workbenchNavigator.modifyLayout(layout => layout.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25}));

    // Add view-1 to the left part
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.101');
    await routerPage.enterBlankPartId('left');
    await routerPage.clickNavigate();

    // Expect view-1 to be active
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testee1ViewPage).toBeActive();

    // Add view-2 to the left part
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.102');
    await routerPage.enterBlankPartId('left');
    await routerPage.clickNavigate();

    // Expect view-2 to be active
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // Activate view-1
    await testee1ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // Close view-1
    await testee1ViewPage.view.tab.close();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-2 not to be present
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).not.toBeAttached();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect no test views to be present
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).not.toBeAttached();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be present
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).not.toBeAttached();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 and view-2 to be present
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be closed
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
  });

  test('should put main-area grid-related navigations into browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view-1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.101');
    await routerPage.checkActivate(false);
    await routerPage.enterInsertionIndex('end');
    await routerPage.clickNavigate();

    // Add view-2
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.102');
    await routerPage.checkActivate(false);
    await routerPage.enterInsertionIndex('end');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Activate view-1
    await testee1ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // Activate view-2
    await testee2ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // Activate view-1
    await testee1ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // Close view-1
    await testee1ViewPage.view.tab.close();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-2 to be active
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
  });

  test.describe('Standalone Component', () => {

    test('should display standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/component');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({loadComponent: () => component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-component');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-children/module');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/load-children/routes');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/standalone-view-test-page/children');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });
  });

  test.describe('Non-Standalone Component', () => {

    test('should display non-standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/component');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(nonStandaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });

    test('should display non-standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/load-children/module');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(nonStandaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });

    test('should display non-standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath('test-pages/non-standalone-view-test-page/children');
      await routerPage.enterTarget(await routerPage.view.getViewId());
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO, {cssClass: 'testee'});
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(nonStandaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });
  });
});
