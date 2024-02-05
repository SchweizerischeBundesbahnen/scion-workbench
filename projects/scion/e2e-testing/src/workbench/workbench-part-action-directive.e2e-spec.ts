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
    const viewPage1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const view1 = viewPage1.view;
    await viewPage1.addViewAction({content: 'search', cssClass: 'view-1-search-action'});

    const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    const view2 = viewPage2.view;
    await viewPage2.addViewAction({content: 'settings', cssClass: 'view-2-settings-action'});
    await viewPage2.addViewAction({content: 'launch', cssClass: 'view-2-launch-action'});

    await view1.tab.click();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-1-search-action'}).locator).toBeVisible();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    await view2.tab.click();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-2-settings-action'}).locator).toBeVisible();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-2-launch-action'}).locator).toBeVisible();

    await appPO.activePart({inMainArea: true}).closeViewTabs();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.activePart({inMainArea: true}).action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();
  });
});
