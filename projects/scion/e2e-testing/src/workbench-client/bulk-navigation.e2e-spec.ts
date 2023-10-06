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
import {BulkNavigationTestPagePO} from './page-object/test-pages/bulk-navigation-test-page.po';

test.describe('Bulk Navigation', () => {

  test('should navigate to multiple views if waiting for each navigation to complete', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const bulkNavigationTestPage = await BulkNavigationTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    await bulkNavigationTestPage.enterViewCount(10);
    await bulkNavigationTestPage.enterCssClass('bulk-navigation-test-target');
    // Since waiting for microfrontends to load takes some time, an interval of 500ms is used.
    await bulkNavigationTestPage.clickNavigateAwait({probeInterval: 500});

    await expect(await appPO.activePart({inMainArea: true}).getViewIds({cssClass: 'bulk-navigation-test-target'})).toHaveLength(10);
  });

  test('should navigate to multiple views if not waiting for each navigation to complete', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const bulkNavigationTestPage = await BulkNavigationTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    await bulkNavigationTestPage.enterViewCount(10);
    await bulkNavigationTestPage.enterCssClass('bulk-navigation-test-target');
    await bulkNavigationTestPage.clickNavigateNoAwait();

    await expect(await appPO.activePart({inMainArea: true}).getViewIds({cssClass: 'bulk-navigation-test-target'})).toHaveLength(10);
  });
});
