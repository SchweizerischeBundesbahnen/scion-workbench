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
import {PartPagePO} from './page-object/part-page.po';

test.describe('Workbench Part Action Directive', () => {

  test('should stick to a view if registered in the context of a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart('part.left')
      .addPart('part.right-top', {align: 'right'})
      .addPart('part.right-bottom', {relativeTo: 'part.right-top', align: 'bottom'})
      .addView('view.101', {partId: 'part.left'})
      .addView('view.102', {partId: 'part.left'})
      .addView('view.103', {partId: 'part.right-top'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      .navigateView('view.103', ['test-view'])
      .navigatePart('part.right-bottom', ['test-part']),
    );

    // Register part action for view 1.
    const viewPage1 = new ViewPagePO(appPO.view({viewId: 'view.101'}));
    await viewPage1.registerPartActions({content: 'search', cssClass: 'view-1-search-action'});

    // Register part action for view 2.
    const viewPage2 = new ViewPagePO(appPO.view({viewId: 'view.102'}));
    await viewPage2.view.tab.click();
    await viewPage2.registerPartActions([
      {content: 'settings', cssClass: 'view-2-settings-action'},
      {content: 'launch', cssClass: 'view-2-launch-action'},
    ]);

    // Activate view 1.
    await viewPage1.view.tab.click();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-1-search-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    // Activate view 2.
    await viewPage2.view.tab.click();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-2-settings-action'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-2-launch-action'}).locator).toBeVisible();

    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    // Close all views.
    await appPO.part({partId: 'part.left'}).bar.viewTabBar.closeTabs();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-top'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();

    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-1-search-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-2-settings-action'}).locator).not.toBeAttached();
    await expect(appPO.part({partId: 'part.right-bottom'}).bar.action({cssClass: 'view-2-launch-action'}).locator).not.toBeAttached();
  });

  test('should stick to a part if registered in the context of a part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left'})
      .addPart('part.right', {align: 'right'})
      .addPart('part.bottom', {align: 'bottom'})
      .navigatePart('part.left', ['test-part'])
      .navigatePart('part.right', ['test-part'])
      .navigatePart('part.bottom', ['test-part']),
    );

    const leftPartPage = new PartPagePO(appPO.part({partId: 'part.left'}));
    const rightPartPage = new PartPagePO(appPO.part({partId: 'part.right'}));

    // Register 'testee-1' part action in left part.
    await leftPartPage.registerPartActions({content: 'testee-1', cssClass: 'left-part-testee-1'});

    // Register 'testee-2' and 'testee-3' part action in right part.
    await rightPartPage.registerPartActions([
      {content: 'testee-2', cssClass: 'right-part-testee-2'},
      {content: 'testee-3', cssClass: 'right-part-testee-3'},
    ]);

    // Expect 'testee-1' part action to be visible in left part.
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'left-part-testee-1'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'left-part-testee-1'}).locator).not.toBeVisible();
    await expect(appPO.part({partId: 'part.bottom'}).bar.action({cssClass: 'left-part-testee-1'}).locator).not.toBeVisible();

    // Expect 'testee-2' part action to be visible in right part.
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'right-part-testee-2'}).locator).not.toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'right-part-testee-2'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.bottom'}).bar.action({cssClass: 'right-part-testee-2'}).locator).not.toBeVisible();

    // Expect 'testee-2' part action to be visible in right part.
    await expect(appPO.part({partId: 'part.left'}).bar.action({cssClass: 'right-part-testee-3'}).locator).not.toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).bar.action({cssClass: 'right-part-testee-3'}).locator).toBeVisible();
    await expect(appPO.part({partId: 'part.bottom'}).bar.action({cssClass: 'right-part-testee-3'}).locator).not.toBeVisible();
  });
});
