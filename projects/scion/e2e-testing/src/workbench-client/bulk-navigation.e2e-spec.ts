/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {BulkNavigationTestPagePO} from './page-object/test-pages/bulk-navigation-test-page.po';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Bulk Navigation', () => {

  test('should navigate to multiple views if waiting for each navigation to complete', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'navigator'},
      properties: {
        path: 'test-pages/bulk-navigation-test-page',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
      },
    });

    // Open test page.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'navigator'}, {cssClass: 'navigator'});
    const bulkNavigationTestPage = new BulkNavigationTestPagePO(appPO.view({cssClass: 'navigator'}));

    await bulkNavigationTestPage.clickNavigateAwait({component: 'testee'}, {
      count: 10,
      target: 'blank',
      cssClass: 'bulk-navigation-test-target',
    });

    await expect(appPO.views({cssClass: 'bulk-navigation-test-target'})).toHaveCount(10);
  });

  test('should navigate to multiple views if not waiting for each navigation to complete', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'navigator'},
      properties: {
        path: 'test-pages/bulk-navigation-test-page',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
      },
    });

    // Open test page.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'navigator'}, {cssClass: 'navigator'});
    const bulkNavigationTestPage = new BulkNavigationTestPagePO(appPO.view({cssClass: 'navigator'}));

    await bulkNavigationTestPage.clickNavigateNoAwait({component: 'testee'}, {
      count: 10,
      target: 'blank',
      cssClass: 'bulk-navigation-test-target',
    });

    await expect(appPO.views({cssClass: 'bulk-navigation-test-target'})).toHaveCount(10);
  });
});
