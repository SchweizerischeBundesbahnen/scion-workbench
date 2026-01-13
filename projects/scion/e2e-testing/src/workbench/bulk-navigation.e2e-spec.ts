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
import {BulkNavigationTestPagePO} from './page-object/test-pages/bulk-navigation-test-page.po';
import {expect} from '@playwright/test';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Bulk Navigation', () => {

  test('should navigate to multiple views if waiting for each navigation to complete', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/bulk-navigation-test-page'], {cssClass: 'testee'});

    const bulkNavigationTestPage = new BulkNavigationTestPagePO(appPO.view({cssClass: 'testee'}));
    await bulkNavigationTestPage.enterViewCount(10);
    await bulkNavigationTestPage.enterCssClass('bulk-navigation-test-target');
    await bulkNavigationTestPage.clickNavigateAwait();

    await expect(appPO.views({cssClass: 'bulk-navigation-test-target'})).toHaveCount(10);
  });

  test('should navigate to multiple views if not waiting for each navigation to complete', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/bulk-navigation-test-page'], {cssClass: 'testee'});

    const bulkNavigationTestPage = new BulkNavigationTestPagePO(appPO.view({cssClass: 'testee'}));
    await bulkNavigationTestPage.enterViewCount(10);
    await bulkNavigationTestPage.enterCssClass('bulk-navigation-test-target');
    await bulkNavigationTestPage.clickNavigateNoAwait();

    await expect(appPO.views({cssClass: 'bulk-navigation-test-target'})).toHaveCount(10);
  });
});
