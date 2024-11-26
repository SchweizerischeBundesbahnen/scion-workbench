/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {WorkbenchThemeTestPagePO} from './page-object/test-pages/workbench-theme-test-page.po';

test.describe('WorkbenchClient', () => {

  test('should provide workbench theme', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const testPage = await WorkbenchThemeTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    await appPO.changeColorScheme('light');
    await expect(testPage.theme).toHaveText('scion-light');

    await appPO.changeColorScheme('dark');
    await expect(testPage.theme).toHaveText('scion-dark');
  });

  test('should provide workbench color scheme', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const testPage = await WorkbenchThemeTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    await appPO.changeColorScheme('light');
    await expect(testPage.colorScheme).toHaveText('light');

    await appPO.changeColorScheme('dark');
    await expect(testPage.colorScheme).toHaveText('dark');
  });

  test('should propagate theme to inactive view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const testPage = await WorkbenchThemeTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    // Open new tab to deactivate testPage.
    await appPO.openNewViewTab();

    await appPO.changeColorScheme('light');
    await expect(testPage.theme).toHaveText('scion-light');

    await appPO.changeColorScheme('dark');
    await expect(testPage.theme).toHaveText('scion-dark');
  });
});
