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
import {BulkNavigationTestPagePO} from './page-object/bulk-navigation-test-page.po';
import {expect} from '@playwright/test';

test.describe('Bulk Navigation', () => {

  test('should navigate to multiple views if waiting for each navigation to complete', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const bulkNavigationTestPagePO = await BulkNavigationTestPagePO.navigateTo(appPO, workbenchNavigator);
    await bulkNavigationTestPagePO.enterViewCount(10);
    await bulkNavigationTestPagePO.enterCssClass('bulk-navigation-test-target');
    await bulkNavigationTestPagePO.clickNavigateAwait();

    await expect(await appPO.getViewTabCount({viewCssClass: 'bulk-navigation-test-target'})).toEqual(10);
  });

  test('should navigate to multiple views if not waiting for each navigation to complete', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const bulkNavigationTestPagePO = await BulkNavigationTestPagePO.navigateTo(appPO, workbenchNavigator);
    await bulkNavigationTestPagePO.enterViewCount(10);
    await bulkNavigationTestPagePO.enterCssClass('bulk-navigation-test-target');
    await bulkNavigationTestPagePO.clickNavigateNoAwait();

    await expect(await appPO.getViewTabCount({viewCssClass: 'bulk-navigation-test-target'})).toEqual(10);
  });
});
