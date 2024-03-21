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
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {AngularRouterTestPagePO} from './page-object/test-pages/angular-router-test-page.po';
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';

test.describe('Navigational State', () => {

  test('should have empty state when not passing state', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({});
  });

  test('should have state passed (WorkbenchRouter.navigate)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterState({some: 'state'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });

  test('should have state passed (WorkbenchLayout.navigateView)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('right', {align: 'right'});
    await layoutPage.addView('testee', {partId: 'right', activateView: true, cssClass: 'testee'});
    await layoutPage.navigateView('testee', ['test-view'], {state: {some: 'state'}});

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
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
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

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
    await routerPage.enterCommands(['test-view']);
    await routerPage.enterState({state1: 'state 1'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({state1: 'state 1'});

    // Navigate view again with a different state
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view', {matrix: 'param'}]);
    await routerPage.enterState({state2: 'state 2'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    await expect.poll(() => viewPage.getState()).toEqual({state2: 'state 2'});
    await expect.poll(() => viewPage.getParams()).toEqual({matrix: 'param'});

    // Navigate view again without state
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view']);
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    await expect.poll(() => viewPage.getState()).toEqual({});
    await expect.poll(() => viewPage.getParams()).toEqual({});

    // Navigate view again with a different state
    await routerPage.view.tab.click();
    await routerPage.enterCommands(['test-view']);
    await routerPage.enterState({state3: 'state 3'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    await expect.poll(() => viewPage.getState()).toEqual({state3: 'state 3'});
  });

  test('should discard state when reloading the page', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterState({some: 'state'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    await appPO.reload();
    await expect.poll(() => viewPage.getState()).toEqual({});
  });

  test('should maintain state when navigating a different view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.enterPath('test-view');
    await routerPage.enterState({some: 'state'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});

    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // Expect view state to be preserved.
    await viewPage.view.tab.click();
    await expect.poll(() => viewPage.getState()).toEqual({some: 'state'});
  });

  test('should maintain state when navigating back and forth in browser history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'router', partId: 'left', activateView: true, cssClass: 'router'},
        {id: 'testee', partId: 'right', activateView: true, cssClass: 'testee'},
      ],
      navigateViews: [
        {id: 'router', commands: ['test-router']},
        {id: 'testee', commands: ['test-view']},
      ],
    });
    await appPO.switchPerspective('perspective');

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});
    await routerPage.enterPath('test-view');
    await routerPage.enterState({'state': 'a'});
    await routerPage.enterTarget('testee');
    await routerPage.clickNavigate();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'a'});

    // Move the view to the left and back again, simulating navigation without explicitly setting the state.
    // When navigating back, expect the view state to be restored.
    await viewPage.view.tab.moveTo('left');
    await viewPage.view.tab.moveTo('right');

    await routerPage.enterPath('test-view');
    await routerPage.enterState({'state': 'b'});
    await routerPage.enterTarget('testee');
    await routerPage.clickNavigate();
    await expect.poll(() => viewPage.getState()).toEqual({state: 'b'});

    await routerPage.enterPath('test-view');
    await routerPage.enterState({'state': 'c'});
    await routerPage.enterTarget('testee');
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

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'workbench-router', partId: 'left', activateView: true, cssClass: 'workbench-router'},
        {id: 'angular-router', partId: 'left', cssClass: 'angular-router'},
      ],
      navigateViews: [
        {id: 'workbench-router', commands: ['test-router']},
        {id: 'angular-router', commands: ['test-pages/angular-router-test-page']},
      ],
    });
    await appPO.switchPerspective('perspective');

    // Open test view
    const routerPage = new RouterPagePO(appPO, {cssClass: 'workbench-router'});
    await routerPage.enterCommands(['test-view']);
    await routerPage.enterState({some: 'state'});
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('blank');
    await routerPage.enterBlankPartId('right');
    await routerPage.clickNavigate();

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
