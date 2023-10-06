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
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Startup', () => {

  test('should construct routed components contained in the URL only after the workbench has completed startup [#1]', async ({appPO, workbenchNavigator, consoleLogs, browserDialogs}) => {
    // Start the workbench, but delay the startup by showing a confirmation dialog.
    await appPO.navigateTo({microfrontendSupport: false, confirmStartup: true, launcher: 'LAZY'});

    // Wait until the startup of the Workbench has completed.
    await appPO.waitUntilWorkbenchStarted();

    // Open the test view. This view would error when constructed before the workbench startup completed.
    await workbenchNavigator.openInNewTab(ViewPagePO);

    // Reload the app with the current layout to simulate views being instantiated right at startup.
    await appPO.reload();
    await appPO.waitUntilWorkbenchStarted();

    // Expect two browser dialogs having been accepted.
    await expect(browserDialogs.get()).toEqual([
      {type: 'alert', message: 'Click to continue Workbench Startup.'},
      {type: 'alert', message: 'Click to continue Workbench Startup.'},
    ]);

    // Expect the test view not to error.
    await expect(await consoleLogs.get({severity: 'error'})).toEqual([]);

    // Expect the test view to show.
    const testingView = appPO.view({cssClass: 'e2e-test-view'});
    await expect(await testingView.isPresent()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });
});
