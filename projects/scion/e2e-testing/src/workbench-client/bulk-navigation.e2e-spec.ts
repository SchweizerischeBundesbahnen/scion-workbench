/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {BulkNavigationPagePO} from './page-object/bulk-navigation-page.po';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';

test.describe('Bulk Navigation', () => {

  test('should navigate to multiple views if waiting for each navigation to complete', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register capability for opening a test view
    const registerWorkbenchCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerWorkbenchCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {
        component: 'bulk-navigation-test-target',
      },
      properties: {
        path: 'test-view',
        title: 'Bulk Navigation Test Target',
        cssClass: 'bulk-navigation-test-target',
      },
    });

    const bulkNavigationPagePO = await BulkNavigationPagePO.navigateTo(appPO, microfrontendNavigator);
    await bulkNavigationPagePO.enterViewCount(10);
    await bulkNavigationPagePO.clickNavigateAwait();

    await expect(await appPO.getViewTabCount({viewCssClass: 'bulk-navigation-test-target'})).toEqual(10);
  });

  test('should navigate to multiple views if not waiting for each navigation to complete', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register capability for opening a test view
    const registerWorkbenchCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerWorkbenchCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {
        component: 'bulk-navigation-test-target',
      },
      properties: {
        path: 'test-view',
        title: 'Bulk Navigation Test Target',
        cssClass: 'bulk-navigation-test-target',
      },
    });

    const bulkNavigationPagePO = await BulkNavigationPagePO.navigateTo(appPO, microfrontendNavigator);
    await bulkNavigationPagePO.enterViewCount(10);
    await bulkNavigationPagePO.clickNavigateNoAwait();

    await expect(await appPO.getViewTabCount({viewCssClass: 'bulk-navigation-test-target'})).toEqual(10);
  });
});
