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
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect.poll(() => viewPage.getState()).toEqual({});
  });

  test('should have state passed', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterState({some: 'state'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });

  test('should preserve data type of state', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterState({
      state1: 'value',
      state2: '<number>0</number>',
      state3: '<number>2</number>',
      state4: '<boolean>true</boolean>',
      state5: '<boolean>false</boolean>',
      state6: '<null>',
      state7: '<undefined>',
    });
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
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
    await routerPage.enterPath('test-view');
    await routerPage.enterState({state1: 'state 1'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect.poll(() => viewPage.getState()).toEqual({state1: 'state 1'});

    // Navigate view again with a different state
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({matrix: 'param'});
    await routerPage.enterState({state2: 'state 2'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    await expect.poll(() => viewPage.getState()).toEqual({state2: 'state 2'});
    await expect.poll(() => viewPage.getParams()).toEqual({matrix: 'param'});

    // Navigate view again without state
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterMatrixParams({});
    await routerPage.enterState({});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    await expect.poll(() => viewPage.getState()).toEqual({});
    await expect.poll(() => viewPage.getParams()).toEqual({});

    // Navigate view again with a different state
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterState({state3: 'state 3'});
    await routerPage.clickNavigate();

    await expect.poll(() => viewPage.getState()).toEqual({state3: 'state 3'});
  });

  test('should discard state when reloading the page', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterState({some: 'state'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    await appPO.reload();
    await expect.poll(() => viewPage.getState()).toEqual({});
  });

  test('should maintain state when navigating a different view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterState({some: 'state'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterState({});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // Expect view state to be preserved.
    await viewPage.view.tab.click();
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });

  test('should maintain state when navigating back and forth in browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await viewPage.view.tab.moveTo(await viewPage.view.part.getPartId(), {region: 'east'});

    await routerPage.enterPath('test-view');
    await routerPage.enterState({'state': 'a'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'a'});

    await routerPage.enterPath('test-view');
    await routerPage.enterState({'state': 'b'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'b'});

    await routerPage.enterPath('test-view');
    await routerPage.enterState({'state': 'c'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();
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

    // Open Workbench Router
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // Open Angular router
    await routerPage.enterPath('test-pages/angular-router-test-page');
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();
    const angularRouterPage = new AngularRouterTestPagePO(appPO, {viewId: 'view.101'});

    // Open test view
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterState({some: 'state'});
    await routerPage.enterTarget('view.102');
    await routerPage.clickNavigate();
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await viewPage.view.tab.moveTo(await viewPage.view.part.getPartId(), {region: 'east'});

    // Expect view state to be passed to the view.
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    // Navigate through the Angular router
    await angularRouterPage.view.tab.click();
    await angularRouterPage.navigate('test-view', {outlet: await angularRouterPage.view.getViewId()});

    // Expect view state to be preserved.
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });
});
