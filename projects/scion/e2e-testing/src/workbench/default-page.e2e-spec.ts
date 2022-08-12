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
import {StartPagePO} from '../start-page.po';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Default Page', () => {

  test('should display the default page when no view is opened', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const startPagePO = new StartPagePO(appPO);

    await expect(await appPO.isDefaultPageShowing('app-start-page')).toBe(true);
    await expect(await startPagePO.isPresent()).toBe(true);

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewId = await viewPO.getViewId();
    await expect(await appPO.isDefaultPageShowing('app-start-page')).toBe(false);
    await expect(await appPO.findViewTab({viewId}).isPresent()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(1);

    // Close the view
    await appPO.findViewTab({viewId}).close();
    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await appPO.isDefaultPageShowing('app-start-page')).toBe(true);
  });
});
