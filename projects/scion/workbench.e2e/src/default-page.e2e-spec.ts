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
import { StartPagePO } from './page-object/start-page.po';
import { ViewPagePO } from './page-object/view-page.po';

describe('Default Page', () => {

  const appPO = new AppPO();

  beforeEach(async () => {
    await appPO.navigateTo({microfrontendSupport: false});
  });

  it('should display the default page when no view is opened', async () => {
    await expect(await appPO.isDefaultPageShowing('app-start-page')).toBe(true);
    await expect(await new StartPagePO().isPresent()).toBe(true);

    // Open a view
    const viewPO = await ViewPagePO.openInNewTab();
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
