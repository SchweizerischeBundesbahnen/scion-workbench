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
import {BulkNavigationPagePO} from './page-object/bulk-navigation-page.po';
import {expect} from '@playwright/test';

test.describe('Bulk Navigation', () => {

  test('should navigate to multiple views if waiting for each navigation to complete', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const bulkNavigationPagePO = await BulkNavigationPagePO.navigateTo(appPO, workbenchNavigator);
    await bulkNavigationPagePO.enterViewCount(10);
    await bulkNavigationPagePO.enterCssClass('bulk-navigation-test-target');
    await bulkNavigationPagePO.clickNavigateAwait();

    await expect(await appPO.getViewTabCount({viewCssClass: 'bulk-navigation-test-target'})).toEqual(10);
  });

  test('should navigate to multiple views if not waiting for each navigation to complete', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const bulkNavigationPagePO = await BulkNavigationPagePO.navigateTo(appPO, workbenchNavigator);
    await bulkNavigationPagePO.enterViewCount(10);
    await bulkNavigationPagePO.enterCssClass('bulk-navigation-test-target');
    await bulkNavigationPagePO.clickNavigateNoAwait();

    await expect(await appPO.getViewTabCount({viewCssClass: 'bulk-navigation-test-target'})).toEqual(10);
  });
});
