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
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {MessagingPagePO} from './page-object/messaging-page.po';

test.describe('Workbench View', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that shows splash.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
        cssClass: 'testee',
      },
      params: [
        {
          name: 'param',
          required: false,
        },
      ],
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.clickNavigate();

    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const viewId = await testeeViewTabPO.getViewId();
    const testeeViewPagePO = new ViewPagePO(appPO, viewId);

    // Expect splash to display.
    await expect(testeeViewPagePO.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messageClientPagePO = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messageClientPagePO.publishMessage(`signal-ready/${testeeViewPagePO.viewId}`);
    await messageClientPagePO.viewTab.close();

    // Expect splash not to display.
    await expect(testeeViewPagePO.outlet.splash).not.toBeVisible();

    await test.step('should not show splash if navigating to the same view again', async () => {
      // Navigate to the same view again.
      await routerPagePO.viewTab.click();
      await routerPagePO.enterQualifier({component: 'testee'});
      await routerPagePO.enterTarget(viewId);
      await routerPagePO.enterParams({param: 'test'});
      await routerPagePO.clickNavigate();

      // Expect splash not to display.
      await testeeViewPagePO.viewTab.click();
      await expect(testeeViewPagePO.outlet.splash).not.toBeVisible();
    });
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that does not show splash.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: false,
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.clickNavigate();

    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());

    // Expect splash not to display.
    await expect(testeeViewPagePO.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that does not show splash.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.clickNavigate();

    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());

    // Expect splash not to display.
    await expect(testeeViewPagePO.outlet.splash).not.toBeVisible();
  });
});
