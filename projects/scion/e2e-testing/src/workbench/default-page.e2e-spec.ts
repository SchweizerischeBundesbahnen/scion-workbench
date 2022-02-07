/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {StartPagePO} from '../start-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {consumeBrowserLog} from '../helper/testing.util';

describe('Default Page', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  it('should display the default page when no view is opened', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
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
