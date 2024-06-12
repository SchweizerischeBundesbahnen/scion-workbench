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

test.describe('Navigational State', () => {

  test('should have empty state when not passing state', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({});
  });

  test('should pass state (WorkbenchRouter.navigate)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      state: {some: 'state'},
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });

  test('should pass state (WorkbenchLayout.navigateView)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {align: 'right'})
      .addView('testee', {partId: 'right', activateView: true, cssClass: 'testee'})
      .navigateView('testee', ['test-view'], {state: {some: 'state'}}),
    );

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
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
    await expect.poll(() => viewPage.getState()).toEqual({
      state1: 'value',
      state2: '0 [number]',
      state3: '2 [number]',
      state4: 'true [boolean]',
      state5: 'false [boolean]',
      state6: 'null [null]',
      state7: 'undefined [undefined]',
    });
  });

  test('should replace/discard state when navigating view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Navigate view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      state: {state1: 'state 1'},
      cssClass: 'testee'
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({state1: 'state 1'});

    // Navigate view again with a different state
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view', {matrix: 'param'}], {
      state: {state2: 'state 2'},
      cssClass: 'testee'
    });

    await expect.poll(() => viewPage.getState()).toEqual({state2: 'state 2'});
    await expect.poll(() => viewPage.getParams()).toEqual({matrix: 'param'});

    // Navigate view again without state
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      cssClass: 'testee'
    });

    await expect.poll(() => viewPage.getState()).toEqual({});
    await expect.poll(() => viewPage.getParams()).toEqual({});

    // Navigate view again with a different state
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      state: {state3: 'state 3'},
      cssClass: 'testee'
    });

    await expect.poll(() => viewPage.getState()).toEqual({state3: 'state 3'});
  });

  test('should discard state when reloading the page', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      state: {some: 'state'},
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    await appPO.reload();
    await expect.poll(() => viewPage.getState()).toEqual({});
  });

  test('should maintain state when navigating a different view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      state: {some: 'state'},
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
    });

    // Expect view state to be preserved.
    await viewPage.view.tab.click();
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });

  test('should maintain state when navigating back and forth in browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('left')
      .addPart('right', {align: 'right'})
      .addView('router', {partId: 'left', cssClass: 'router'})
      .addView('testee', {partId: 'right', cssClass: 'testee'})
      .navigateView('router', ['test-router'])
      .navigateView('testee', ['test-view']),
    );

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});
    await routerPage.navigate(['test-view'], {
      target: 'testee',
      state: {'state': 'a'},
    });
    await expect.poll(() => viewPage.getState()).toEqual({state: 'a'});

    // Move the view to the left and back again, simulating navigation without explicitly setting the state.
    // When navigating back, expect the view state to be restored.
    await viewPage.view.tab.moveTo('left');
    await viewPage.view.tab.moveTo('right');

    await routerPage.navigate(['test-view'], {
      target: 'testee',
      state: {'state': 'b'},
    });
    await expect.poll(() => viewPage.getState()).toEqual({state: 'b'});

    await routerPage.navigate(['test-view'], {
      target: 'testee',
      state: {'state': 'c'},
    });
    await expect.poll(() => viewPage.getState()).toEqual({state: 'c'});

    await appPO.navigateBack();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'b'});

    await appPO.navigateBack();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'a'});

    await appPO.navigateForward();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'b'});

    await appPO.navigateForward();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'c'});
  });

  test('should maintain state when navigating through the Angular router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('left')
      .addPart('right', {align: 'right'})
      .addView('workbench-router', {partId: 'left', cssClass: 'workbench-router'})
      .addView('angular-router', {partId: 'left', cssClass: 'angular-router'})
      .navigateView('workbench-router', ['test-router'])
      .navigateView('angular-router', ['test-pages/angular-router-test-page']),
    );

    // Open test view
    const routerPage = new RouterPagePO(appPO, {cssClass: 'workbench-router'});
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      partId: 'right',
      state: {some: 'state'},
      cssClass: 'testee'
    });

    // Expect view state to be passed to the view.
    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    // Navigate through the Angular router
    const angularRouterPage = new AngularRouterTestPagePO(appPO, {cssClass: 'angular-router'});
    await angularRouterPage.view.tab.click();
    await angularRouterPage.navigate(['test-view'], {outlet: await angularRouterPage.view.getViewId()});

    // Expect view state to be preserved.
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });
});
