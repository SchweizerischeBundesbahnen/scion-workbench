/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CustomMatchers} from './src/matcher/custom-matchers.definition';
import {defineConfig} from '@playwright/test';

const runInCI = !!process.env['CI'];
const runHeadless = !!process.env['HEADLESS'];

export default defineConfig({
  forbidOnly: runInCI,
  fullyParallel: true,
  webServer: runInCI ? [
    {
      command: 'npm run workbench-testing-app:dist-serve',
      port: 4200,
      reuseExistingServer: false,
    },
    {
      command: 'npm run workbench-client-testing-app:4201:dist-serve',
      port: 4201,
      reuseExistingServer: false,
    },
    {
      command: 'npm run workbench-client-testing-app:4202:dist-serve',
      port: 4202,
      reuseExistingServer: false,
    },
    {
      command: 'npm run workbench-testing-app:basehref:dist-serve',
      port: 4300,
      reuseExistingServer: false,
    },
    // TODO [Angular 21] remove when `@angular-devkit/build-angular:browser` builder is deprecated
    {
      command: 'npm run workbench-testing-app:basehref-webpack:dist-serve',
      port: 4400,
      reuseExistingServer: false,
    },
  ] : [],
  use: {
    browserName: 'chromium',
    headless: runHeadless,
    viewport: {width: 1920, height: 1200},
    baseURL: 'http://localhost:4200',
    launchOptions: {
      // By default, Playwright hides scrollbars in headless mode, causing problems with tests using `sci-scrollbar`, e.g., to check whether content overflows.
      // Therefore, we instruct Playwright to ignore this default. Refer to https://github.com/microsoft/playwright/issues/5778#issuecomment-796264504 for more details.
      ignoreDefaultArgs: ['--hide-scrollbars'],
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  testMatch: /.*\.e2e-spec\.ts/,
});

// Install SCION-specific matchers that can be used as expectations.
CustomMatchers.install();
