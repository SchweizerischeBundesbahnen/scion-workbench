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

test.describe('HTML base HREF', () => {

  /**
   * # esbuild builder (@angular-devkit/build-angular:application)
   *
   * This test expects the application to be served on 'http://localhost:4300/subdir/browser' with '/subdir/browser/' configured as the base URL.
   *
   * Start the app using the following command:
   *
   * ```
   * npm run workbench-testing-app:basehref:serve
   * ```
   */
  test('should fetch the icon font if deployed in a subdirectory (esbuild)', async ({page, appPO}) => {
    const response = page.waitForResponse(/scion-workbench-icons\.(ttf|woff)/);
    await appPO.navigateTo({url: 'http://localhost:4300/subdir/browser/', microfrontendSupport: false});
    // The icon font is loaded when a view is opened (chevron icon in the tab bar).
    await appPO.openNewViewTab();

    // Expect the icon font to be loaded.
    const iconFontLoaded = (await response).ok();
    expect(iconFontLoaded).toBe(true);
  });

  /**
   * # webpack builder (@angular-devkit/build-angular:browser)
   *
   * This test expects the application to be served on 'http://localhost:4400/subdir' with '/subdir/' configured as the base URL.
   *
   * Start the app using the following command:
   *
   * ```
   * npm run workbench-testing-app:basehref-webpack:serve
   * ```
   *
   * TODO [Angular 19] remove when `@angular-devkit/build-angular:browser` builder is deprecated
   */
  test('should fetch the icon font if deployed in a subdirectory (webpack)', async ({page, appPO}) => {
    const response = page.waitForResponse(/scion-workbench-icons\.(ttf|woff)/);
    await appPO.navigateTo({url: 'http://localhost:4400/subdir/', microfrontendSupport: false});
    // The icon font is loaded when a view is opened (chevron icon in the tab bar).
    await appPO.openNewViewTab();

    // Expect the icon font to be loaded.
    const iconFontLoaded = (await response).ok();
    expect(iconFontLoaded).toBe(true);
  });
});
