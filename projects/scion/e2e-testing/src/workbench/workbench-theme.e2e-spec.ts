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

test.describe('Workbench', () => {

  test('should provide light and dark theme', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const testPage = await WorkbenchThemeTestPagePO.openInNewTab(appPO, workbenchNavigator);

    await test.step('light theme', async () => {
      await appPO.changeColorScheme('light');

      await expect(testPage.theme).toHaveText('scion-light');
      await expect(testPage.colorScheme).toHaveText('light');

      await expect(appPO.workbench).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(appPO.workbench).toHaveCSS('color-scheme', 'light');
    });

    await test.step('dark theme', async () => {
      await appPO.changeColorScheme('dark');

      await expect(testPage.theme).toHaveText('scion-dark');
      await expect(testPage.colorScheme).toHaveText('dark');

      await expect(appPO.workbench).toHaveCSS('background-color', 'rgb(29, 29, 29)');
      await expect(appPO.workbench).toHaveCSS('color-scheme', 'dark');
    });
  });
});
