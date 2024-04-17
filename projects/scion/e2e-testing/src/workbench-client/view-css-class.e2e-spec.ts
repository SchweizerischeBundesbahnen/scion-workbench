/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {ViewPagePO} from './page-object/view-page.po';
import {expect} from '@playwright/test';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench View CSS Class', () => {

  test('should associate CSS classes with a capability and navigation', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register test view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee',
        cssClass: 'testee-capability-1',
      },
    });

    // Register test view 2.
    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee',
        cssClass: 'testee-capability-2',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee-2'}});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {align: 'right'})
      .addView('view.100', {partId: 'right', activateView: true, cssClass: 'testee-layout'}),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Navigate to test view 1 passing CSS class 'testee-navigation-1'.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee-navigation-1');
    await routerPage.clickNavigate();
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-1');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-navigation-1');
    // Expect CSS classes of the view to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the capability to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-capability-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-capability-1');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-capability-1');

    // Navigate to test view 2 passing CSS class 'testee-navigation-2'.
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee-navigation-2');
    await routerPage.clickNavigate();
    // Expect CSS classes of the navigation to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-navigation-2');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-navigation-2');
    // Expect CSS classes of the previous navigation not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.outlet.getCssClasses()).not.toContain('testee-navigation-1');
    // Expect CSS classes of the previous capability not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-capability-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-capability-1');
    await expect.poll(() => viewPage.outlet.getCssClasses()).not.toContain('testee-capability-1');
    // Expect CSS classes of the view to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the capability to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-capability-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-capability-2');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-capability-2');

    // Navigate to test view 1 without passing CSS class.
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass([]);
    await routerPage.clickNavigate();
    // Expect CSS classes of the previous navigation not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-1');
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-navigation-2');
    await expect.poll(() => viewPage.outlet.getCssClasses()).not.toContain('testee-navigation-2');
    // Expect CSS classes of the previous capability not to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).not.toContain('testee-capability-2');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).not.toContain('testee-capability-2');
    await expect.poll(() => viewPage.outlet.getCssClasses()).not.toContain('testee-capability-2');
    // Expect CSS classes of the view to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-layout');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-layout');
    // Expect CSS classes of the capability to be set.
    await expect.poll(() => viewPage.view.getCssClasses()).toContain('testee-capability-1');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee-capability-1');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee-capability-1');
  });

  test('should add CSS classes to inactive view (WorkbenchRouter.navigate)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'view', app: 'app1'});
    await routerPage.enterTarget('view.100');
    await routerPage.enterCssClass('testee');
    await routerPage.checkActivate(false);
    await routerPage.clickNavigate();

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee');
  });
});
