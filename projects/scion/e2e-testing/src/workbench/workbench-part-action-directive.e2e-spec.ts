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

test.describe('Workbench Part Action Directive', () => {

  test('should stick to a view if registered in the context of a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTabPO1 = viewPagePO1.viewTabPO;
    await viewPagePO1.addViewAction({content: 'search', cssClass: 'view-1-search-action'});

    const viewPagePO2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTabPO2 = viewPagePO2.viewTabPO;
    await viewPagePO2.addViewAction({content: 'settings', cssClass: 'view-2-settings-action'});
    await viewPagePO2.addViewAction({content: 'launch', cssClass: 'view-2-launch-action'});

    await viewTabPO1.click();
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-1-search-action'}).isPresent()).toBe(true);
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-2-settings-action'}).isPresent()).toBe(false);
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-2-launch-action'}).isPresent()).toBe(false);

    await viewTabPO2.click();
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-1-search-action'}).isPresent()).toBe(false);
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-2-settings-action'}).isPresent()).toBe(true);
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-2-launch-action'}).isPresent()).toBe(true);

    await appPO.activePart({scope: 'mainArea'}).closeViewTabs();
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-1-search-action'}).isPresent()).toBe(false);
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-2-settings-action'}).isPresent()).toBe(false);
    await expect(await appPO.activePart({scope: 'mainArea'}).action({cssClass: 'view-2-launch-action'}).isPresent()).toBe(false);
  });
});
