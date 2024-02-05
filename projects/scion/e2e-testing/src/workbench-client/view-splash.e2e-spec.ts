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
import {expect} from '@playwright/test';
import {ViewPagePO} from './page-object/view-page.po';
import {MessagingPagePO} from './page-object/messaging-page.po';

test.describe('Workbench View', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that shows splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
      },
      params: [
        {
          name: 'param',
          required: false,
        },
      ],
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // Expect splash to display.
    await expect(testeeViewPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage('signal-ready/view.101');
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();

    await test.step('should not show splash if navigating to the same view again', async () => {
      // Navigate to the same view again.
      await routerPage.view.tab.click();
      await routerPage.enterQualifier({component: 'testee'});
      await routerPage.enterTarget('view.101');
      await routerPage.enterParams({param: 'test'});
      await routerPage.clickNavigate();

      // Expect splash not to display.
      await testeeViewPage.view.tab.click();
      await expect(testeeViewPage.outlet.splash).not.toBeVisible();
    });
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: false,
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();
  });
});
