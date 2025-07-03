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
import {expect, Page} from '@playwright/test';

test.describe('Browser Session History', () => {

  test('should create single entry in browser session history when loading the application', async ({appPO, page}) => {
    const historyStackSizeBefore = await getBrowserHistoryStackSize(page);
    await appPO.navigateTo({microfrontendSupport: false});

    // Expect single entry added to the browser session history.
    await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    // Expect state in browser session history to contain the workbench layout.
    await expect.poll(() => page.evaluate(() => (history.state as {ɵworkbench?: unknown}).ɵworkbench)).toBeDefined(); // state[WORKBENCH_NAVIGATION_STATE_KEY]: WorkbenchNavigationalState
  });

  test('should create new entry in browser session history when switching perspectives', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create two perspectives (no activation).
    await workbenchNavigator.createPerspective('testee-1', factory => factory.addPart(MAIN_AREA), {activate: false});
    await workbenchNavigator.createPerspective('testee-2', factory => factory.addPart(MAIN_AREA), {activate: false});

    await test.step('Switching to perspective 1 (initial perspective activation)', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 1.
      await appPO.switchPerspective('testee-1');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-1');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });

    await test.step('Switching to perspective 2 (initial perspective activation)', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 2.
      await appPO.switchPerspective('testee-2');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-2');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });

    await test.step('Switching to perspective 1', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 1.
      await appPO.switchPerspective('testee-1');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-1');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });

    await test.step('Switching to perspective 2', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 2.
      await appPO.switchPerspective('testee-2');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-2');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });
  });

  test('should put main grid-related navigations into browser session history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part to the main grid
    await workbenchNavigator.modifyLayout(layout => layout.addPart('part.left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25}));

    // Add view-1 to the left part
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.101',
      partId: 'part.left',
      cssClass: 'testee',
    });

    // Expect view-1 to be active
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testee1ViewPage).toBeActive();

    // Add view-2 to the left part
    await routerPage.navigate(['test-view'], {
      target: 'view.102',
      partId: 'part.left',
      cssClass: 'testee',
    });

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

  test('should put main-area grid-related navigations into browser session history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view-1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.101',
      activate: false,
      position: 'end',
      cssClass: 'testee',
    });

    // Add view-2
    await routerPage.navigate(['test-view'], {
      target: 'view.102',
      activate: false,
      position: 'end',
      cssClass: 'testee',
    });

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
      await routerPage.navigate(['test-pages/standalone-view-test-page/component'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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
      await routerPage.navigate(['test-pages/standalone-view-test-page/load-component'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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
      await routerPage.navigate(['test-pages/standalone-view-test-page/load-children/module'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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
      await routerPage.navigate(['test-pages/standalone-view-test-page/load-children/routes'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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
      await routerPage.navigate(['test-pages/standalone-view-test-page/children'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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
      await routerPage.navigate(['test-pages/non-standalone-view-test-page/component'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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
      await routerPage.navigate(['test-pages/non-standalone-view-test-page/load-children/module'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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
      await routerPage.navigate(['test-pages/non-standalone-view-test-page/children'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

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

/**
 * Reads the number of entries in browser session history.
 */
function getBrowserHistoryStackSize(page: Page): Promise<number> {
  return page.evaluate(() => history.length);
}
