/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO } from './page-object/app.po';
import { browserErrors, confirmAlert } from './util/testing.util';
import { ViewPagePO } from './page-object/view-page.po';

describe('Startup', () => {

  const appPO = new AppPO();

  it('should construct routed components contained in the URL only after the workbench has completed startup [#1]', async () => {
    // Start the workbench, but delay the startup by showing a confirmation dialog.
    await appPO.navigateTo({microfrontendSupport: false, confirmStartup: true, launcher: 'LAZY'});

    // Confirm the alert dialog.
    await confirmAlert();

    // Wait until the startup of the Workbench has completed.
    await appPO.waitUntilWorkbenchStarted();

    // Open the test view. This view would error when constructed before the workbench startup completed.
    await ViewPagePO.openInNewTab();

    // Reload the app with the current layout to simulate views being instantiated right at startup.
    await appPO.reload();

    // Confirm the alert dialog.
    await confirmAlert({confirmDelay: 1000});
    await appPO.waitUntilWorkbenchStarted();

    // Expect the test view not to error.
    await expect(await browserErrors()).toEqual([]);

    // Expect the test view to show.
    const testingViewPO = appPO.findView({cssClass: 'e2e-test-view'});
    await expect(await testingViewPO.isPresent()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(1);
  });
});
