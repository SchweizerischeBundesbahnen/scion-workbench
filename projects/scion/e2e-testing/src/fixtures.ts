/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from './app.po';
import {ConsoleLogs} from './helper/console-logs';
import {BrowserDialogs} from './helper/browser-dialogs';
import {WorkbenchNavigator} from './workbench/workbench-navigator';
import {MicrofrontendNavigator} from './workbench-client/microfrontend-navigator';
import {test as playwrightTest} from '@playwright/test';

/**
 * Provides the environment for each test.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */
export interface TestFixtures {
  /**
   * Central PO to interact with the workbench.
   */
  appPO: AppPO;
  /**
   * Allows navigating to pages of the 'workbench-testing-app' in a new workbench view tab.
   */
  workbenchNavigator: WorkbenchNavigator;
  /**
   * Allows navigating to microfrontends of the 'workbench-client-testing-app' in a new workbench view tab.
   */
  microfrontendNavigator: MicrofrontendNavigator;
  /**
   * Provides messages logged to the browser console.
   */
  consoleLogs: ConsoleLogs;
  /**
   * Provides dialogs (e.g. alerts) opened during test execution.
   */
  browserDialogs: BrowserDialogs;
}

export const test = playwrightTest.extend<TestFixtures>({
  appPO: async ({page}, use) => {
    await use(new AppPO(page));
  },
  workbenchNavigator: async ({appPO}, use) => {
    await use(new WorkbenchNavigator(appPO));
  },
  microfrontendNavigator: async ({appPO}, use) => {
    await use(new MicrofrontendNavigator(appPO));
  },
  consoleLogs: async ({page}, use) => {
    await use(new ConsoleLogs(page));
  },
  browserDialogs: async ({page}, use) => {
    await use(new BrowserDialogs(page, {confirmDelay: 1000}));
  },
});
