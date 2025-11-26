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
import {AngularRouterTestPagePO} from './page-object/test-pages/angular-router-test-page.po';
import {PartPagePO} from './page-object/part-page.po';
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';

test.describe('Navigational State', () => {

  test.describe('View', () => {

    test('should have empty state when not passing state', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {
        cssClass: 'testee',
      });

      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({});
    });

    test('should pass state (WorkbenchRouter.navigate)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {
        state: {some: 'state'},
        cssClass: 'testee',
      });

      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({some: 'state'});
    });

    test('should pass state (WorkbenchLayout.navigateView)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.right', {align: 'right'})
        .addView('testee', {partId: 'part.right', activateView: true, cssClass: 'testee'})
        .navigateView('testee', ['test-view'], {state: {some: 'state'}}),
      );

      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({some: 'state'});
    });

    test('should preserve data type of state', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {
        state: {
          state1: 'value',
          state2: '<number>0</number>',
          state3: '<number>2</number>',
          state4: '<boolean>true</boolean>',
          state5: '<boolean>false</boolean>',
          state6: '<null>',
          state7: '<undefined>',
        },
        cssClass: 'testee',
      });

      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({
        state1: 'value',
        state2: '0 [number]',
        state3: '2 [number]',
        state4: 'true [boolean]',
        state5: 'false [boolean]',
        state6: 'null [null]',
      });
    });

    test('should replace/discard state when navigating view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Navigate view
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {
        state: {state1: 'state 1'},
        cssClass: 'testee',
      });

      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({state1: 'state 1'});

      // Navigate view again with a different state
      await routerPage.view.tab.click();
      await routerPage.navigate(['test-view', {matrix: 'param'}], {
        state: {state2: 'state 2'},
        cssClass: 'testee',
      });

      await expect.poll(() => viewPage.getNavigationState()).toEqual({state2: 'state 2'});
      await expect.poll(() => viewPage.getParams()).toEqual({matrix: 'param'});

      // Navigate view again without state
      await routerPage.view.tab.click();
      await routerPage.navigate(['test-view'], {
        cssClass: 'testee',
      });

      await expect.poll(() => viewPage.getNavigationState()).toEqual({});
      await expect.poll(() => viewPage.getParams()).toEqual({});

      // Navigate view again with a different state
      await routerPage.view.tab.click();
      await routerPage.navigate(['test-view'], {
        state: {state3: 'state 3'},
        cssClass: 'testee',
      });

      await expect.poll(() => viewPage.getNavigationState()).toEqual({state3: 'state 3'});
    });

    test('should discard state when closing the application', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {
        state: {some: 'state'},
        cssClass: 'testee',
      });

      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({some: 'state'});

      // Close and open the application.
      await appPO.reload();
      await expect.poll(() => viewPage.getNavigationState()).toEqual({});
    });

    test('should maintain state when navigating a different view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {
        state: {some: 'state'},
        cssClass: 'testee',
      });

      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({some: 'state'});

      await routerPage.view.tab.click();
      await routerPage.navigate(['test-view'], {
        target: 'blank',
      });

      // Expect view state to be preserved.
      await viewPage.view.tab.click();
      await expect.poll(() => viewPage.getNavigationState()).toEqual({some: 'state'});
    });

    test('should maintain state when navigating back and forth in browser session history', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.1', {partId: 'part.left', cssClass: 'router'})
        .addView('view.2', {partId: 'part.right', cssClass: 'testee'})
        .navigateView('view.1', ['test-router'])
        .navigateView('view.2', ['test-view']),
      );
      const viewPage = new ViewPagePO(appPO, {viewId: 'view.2'});
      const routerPage = new RouterPagePO(appPO, {viewId: 'view.1'});
      await routerPage.navigate(['test-view'], {
        target: 'view.2',
        state: {'state': 'a'},
        activate: false,
      });
      await expect.poll(() => appPO.view({viewId: 'view.2'}).navigation().then(navigation => navigation.state)).toEqual({state: 'a'});

      // Move the view to the left and back again, simulating navigation without explicitly setting the state.
      // When navigating back, expect the view state to be restored.
      await viewPage.view.tab.moveTo('part.left');
      await viewPage.view.tab.moveTo('part.right');

      await routerPage.navigate(['test-view'], {
        target: 'view.2',
        state: {'state': 'b'},
        activate: false,
      });
      await expect.poll(() => appPO.view({viewId: 'view.2'}).navigation().then(navigation => navigation.state)).toEqual({state: 'b'});

      await routerPage.navigate(['test-view'], {
        target: 'view.2',
        state: {'state': 'c'},
        activate: false,
      });
      await expect.poll(() => appPO.view({viewId: 'view.2'}).navigation().then(navigation => navigation.state)).toEqual({state: 'c'});

      await appPO.navigateBack();
      await expect.poll(() => appPO.view({viewId: 'view.2'}).navigation().then(navigation => navigation.state)).toEqual({state: 'b'});

      await appPO.navigateBack();
      await expect.poll(() => appPO.view({viewId: 'view.2'}).navigation().then(navigation => navigation.state)).toEqual({state: 'a'});

      await appPO.navigateForward();
      await expect.poll(() => appPO.view({viewId: 'view.2'}).navigation().then(navigation => navigation.state)).toEqual({state: 'b'});

      await appPO.navigateForward();
      await expect.poll(() => appPO.view({viewId: 'view.2'}).navigation().then(navigation => navigation.state)).toEqual({state: 'c'});
    });

    test('should maintain state when navigating through the Angular router', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('workbench-router', {partId: 'part.left', cssClass: 'workbench-router'})
        .addView('angular-router', {partId: 'part.left', cssClass: 'angular-router'})
        .navigateView('workbench-router', ['test-router'])
        .navigateView('angular-router', ['test-pages/angular-router-test-page']),
      );

      // Open test view
      const routerPage = new RouterPagePO(appPO, {cssClass: 'workbench-router'});
      await routerPage.navigate(['test-view'], {
        target: 'blank',
        partId: 'part.right',
        state: {some: 'state'},
        cssClass: 'testee',
      });

      // Expect view state to be passed to the view.
      const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({some: 'state'});

      // Navigate through the Angular router
      const angularRouterPage = new AngularRouterTestPagePO(appPO, {cssClass: 'angular-router'});
      await angularRouterPage.view.tab.click();
      await angularRouterPage.navigate(['test-view'], {outlet: await angularRouterPage.view.getViewId()});

      // Expect view state to be preserved.
      await expect.poll(() => viewPage.getNavigationState()).toEqual({some: 'state'});
    });

    test('should not affect view resolution', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Navigate view.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {
        state: {state1: 'state 1'},
        target: 'view.100',
      });

      const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
      await expect.poll(() => viewPage.getNavigationState()).toEqual({state1: 'state 1'});
      await expect(appPO.views()).toHaveCount(2);

      // Navigate view again with different state.
      await routerPage.view.tab.click();
      await routerPage.navigate(['test-view'], {
        state: {state2: 'state 2'},
      });
      await expect.poll(() => viewPage.getNavigationState()).toEqual({state2: 'state 2'});
      await expect(appPO.views()).toHaveCount(2);

      // Navigate view again without state.
      await routerPage.view.tab.click();
      await routerPage.navigate(['test-view']);
      await expect.poll(() => viewPage.getNavigationState()).toEqual({});
      await expect(appPO.views()).toHaveCount(2);

      // Navigate view again with different state.
      await routerPage.view.tab.click();
      await routerPage.navigate(['test-view'], {
        state: {state3: 'state 3'},
      });
      await expect.poll(() => viewPage.getNavigationState()).toEqual({state3: 'state 3'});
      await expect(appPO.views()).toHaveCount(2);
    });
  });

  test.describe('Part', () => {

    test('should have empty state when not passing state', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Navigate part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.testee', {align: 'right'})
        .navigatePart('part.testee', ['test-part']),
      );

      const partPage = new PartPagePO(appPO, {partId: 'part.testee'});
      await expect.poll(() => partPage.getNavigationState()).toEqual({});
    });

    test('should pass state (WorkbenchLayout.navigatePart)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Navigate part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.testee', {align: 'right'})
        .navigatePart('part.testee', ['test-part'], {state: {some: 'state'}}),
      );

      const partPage = new PartPagePO(appPO, {partId: 'part.testee'});
      await expect.poll(() => partPage.getNavigationState()).toEqual({some: 'state'});
    });

    test('should replace/discard state when navigating part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Navigate part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.testee', {align: 'right'})
        .navigatePart('part.testee', ['test-part'], {state: {state1: 'state 1'}}),
      );

      const partPage = new PartPagePO(appPO, {partId: 'part.testee'});
      await expect.poll(() => partPage.getNavigationState()).toEqual({state1: 'state 1'});

      // Navigate part again with different state.
      await workbenchNavigator.modifyLayout(layout => layout
        .navigatePart('part.testee', ['test-part'], {state: {state2: 'state 2'}}),
      );

      await expect.poll(() => partPage.getNavigationState()).toEqual({state2: 'state 2'});

      // Navigate part again without state.
      await workbenchNavigator.modifyLayout(layout => layout
        .navigatePart('part.testee', ['test-part']),
      );

      await expect.poll(() => partPage.getNavigationState()).toEqual({});

      // Navigate part again with different state.
      await workbenchNavigator.modifyLayout(layout => layout
        .navigatePart('part.testee', ['test-part'], {state: {state3: 'state 3'}}),
      );

      await expect.poll(() => partPage.getNavigationState()).toEqual({state3: 'state 3'});
    });

    test('should discard state when closing the application', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Navigate part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.testee', {align: 'right'})
        .navigatePart('part.testee', ['test-part'], {state: {some: 'state'}}),
      );

      const partPage = new PartPagePO(appPO, {partId: 'part.testee'});
      await expect.poll(() => partPage.getNavigationState()).toEqual({some: 'state'});

      // Close and open the application.
      await appPO.reload();
      await expect.poll(() => partPage.getNavigationState()).toEqual({});
    });

    test('should maintain state when navigating a different part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Navigate part.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.1', {align: 'left'})
        .addPart('part.2', {align: 'right'})
        .navigatePart('part.1', ['test-part'], {state: {some: 'state'}}),
      );

      const part1Page = new PartPagePO(appPO, {partId: 'part.1'});
      await expect.poll(() => part1Page.getNavigationState()).toEqual({some: 'state'});

      // Navigate another part.
      await workbenchNavigator.modifyLayout(layout => layout
        .navigatePart('part.2', ['test-part']),
      );

      // Expect part state to be preserved.
      await expect.poll(() => part1Page.getNavigationState()).toEqual({some: 'state'});
    });

    test('should maintain state when navigating back and forth in browser session history', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Add part.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.1', {partId: 'part.left'})
        .navigatePart('part.right', ['test-part'])
        .navigateView('view.1', ['test-layout']),
      );

      const layoutPage = new LayoutPagePO(appPO.view({viewId: 'view.1'}));
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({});

      // Navigate part with state 'a'.
      await layoutPage.modifyLayout(layout => layout.navigatePart('part.right', ['test-part'], {state: {state: 'a'}}));
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({state: 'a'});

      // Navigate part with state 'b'.
      await layoutPage.modifyLayout(layout => layout.navigatePart('part.right', ['test-part'], {state: {state: 'b'}}));
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({state: 'b'});

      // Navigate part with state 'c'.
      await layoutPage.modifyLayout(layout => layout.navigatePart('part.right', ['test-part'], {state: {state: 'c'}}));
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({state: 'c'});

      await appPO.navigateBack();
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({state: 'b'});

      await appPO.navigateBack();
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({state: 'a'});

      await appPO.navigateForward();
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({state: 'b'});

      await appPO.navigateForward();
      await expect.poll(() => appPO.part({partId: 'part.right'}).navigation().then(navigation => navigation.state)).toEqual({state: 'c'});
    });
  });
});
