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
   * This test expects the application to be deployed on 'http://localhost:4300/subdir' with '/subdir/' configured as the base URL.
   *
   * Start the app using the following command:
   *
   * ```
   * npm run workbench-testing-app:basehref:serve
   * ```
   */
  test('should fetch the icon font if deployed in a subdirectory', async ({page, appPO}) => {
    const response = page.waitForResponse(/scion-workbench-icons\.(ttf|woff)/);
    await appPO.navigateTo({url: 'http://localhost:4300/subdir', microfrontendSupport: false});

    // Expect the icon font to be loaded.
    const iconFontLoaded = (await response).ok();
    await expect(iconFontLoaded).toBe(true);
  });
});
