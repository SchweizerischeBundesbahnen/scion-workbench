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
import {ViewPagePO} from './page-object/view-page.po';
import {consumeBrowserLog} from '../helper/testing.util';

describe('Viewpart Action', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  it('should be added to all viewparts (global action)', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.findViewPartAction({buttonCssClass: 'e2e-open-new-tab'});

    // Global action should show if no view is opened
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(0);

    // Global action should show in the context of view-1
    const viewPagePO1 = await ViewPagePO.openInNewTab();
    await expect(await viewPagePO1.viewTabPO.isActive()).toBe(true);
    await expect(await viewPagePO1.viewPO.isPresent()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);

    // Global action should show in the context of view-2
    const viewPagePO2 = await ViewPagePO.openInNewTab();
    await expect(await viewPagePO2.viewTabPO.isActive()).toBe(true);
    await expect(await viewPagePO2.viewPO.isPresent()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);

    // Global action should show in the context of view-1
    await viewPagePO2.viewTabPO.close();
    await expect(await viewPagePO1.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);

    // Global action should show if no view is opened
    await viewPagePO1.viewTabPO.close();
    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);
  });

  it('should stick to a view if registered in the context of a view (view-local action)', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const testeeActionButtonPO = appPO.findViewPartAction({buttonCssClass: 'e2e-testee'});

    // Open view-1 and register a view-local viewpart action
    const viewPagePO1 = await ViewPagePO.openInNewTab();
    await viewPagePO1.addViewAction({icon: 'open_in_new', cssClass: 'e2e-testee'});
    await expect(await testeeActionButtonPO.isPresent()).toBe(true);

    // Open view-2, expect the action not to show
    const viewPagePO2 = await ViewPagePO.openInNewTab();
    await expect(await testeeActionButtonPO.isPresent()).toBe(false);

    // Activate view-1, expect the action to show
    await viewPagePO1.viewTabPO.activate();
    await expect(await testeeActionButtonPO.isPresent()).toBe(true);

    // Activate view-2, expect the action not to show
    await viewPagePO2.viewTabPO.activate();
    await expect(await testeeActionButtonPO.isPresent()).toBe(false);

    // Close view-2, expect the action to show because view-1 gets activated
    await viewPagePO2.viewTabPO.close();
    await expect(await testeeActionButtonPO.isPresent()).toBe(true);

    // Close view-1, expect the action not to show because view-1 is closed
    await viewPagePO1.viewTabPO.close();
    await expect(await testeeActionButtonPO.isPresent()).toBe(false);
  });
});
