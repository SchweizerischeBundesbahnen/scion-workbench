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

test.describe('Viewpart Action', () => {

  test('should be added to all viewparts (global action)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Global action should show if no view is opened
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(0);

    // Global action should show in the context of view-1
    const viewPagePO1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await expect(await viewPagePO1.viewTabPO.isActive()).toBe(true);
    await expect(await viewPagePO1.viewPO.isPresent()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);

    // Global action should show in the context of view-2
    const viewPagePO2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await expect(await viewPagePO2.viewTabPO.isActive()).toBe(true);
    await expect(await viewPagePO2.viewPO.isPresent()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);

    // Global action should show in the context of view-1
    await viewPagePO2.viewTabPO.close();
    await expect(await viewPagePO1.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);

    // Global action should show if no view is opened
    await viewPagePO1.viewTabPO.close();
    await expect(await appPO.activePart.getViewIds()).toHaveLength(0);
    await expect(await openNewTabActionButtonPO.isPresent()).toBe(true);
  });

  test('should stick to a view if registered in the context of a view (view-local action)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const testeeActionButtonPO = appPO.activePart.action({cssClass: 'e2e-testee'});

    // Open view-1 and register a view-local viewpart action
    const viewPagePO1 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await viewPagePO1.addViewAction({icon: 'open_in_new', cssClass: 'e2e-testee'});
    await expect(await testeeActionButtonPO.isPresent()).toBe(true);

    // Open view-2, expect the action not to show
    const viewPagePO2 = await workbenchNavigator.openInNewTab(ViewPagePO);
    await expect(await testeeActionButtonPO.isPresent()).toBe(false);

    // Activate view-1, expect the action to show
    await viewPagePO1.viewTabPO.click();
    await expect(await testeeActionButtonPO.isPresent()).toBe(true);

    // Activate view-2, expect the action not to show
    await viewPagePO2.viewTabPO.click();
    await expect(await testeeActionButtonPO.isPresent()).toBe(false);

    // Close view-2, expect the action to show because view-1 gets activated
    await viewPagePO2.viewTabPO.close();
    await expect(await testeeActionButtonPO.isPresent()).toBe(true);

    // Close view-1, expect the action not to show because view-1 is closed
    await viewPagePO1.viewTabPO.close();
    await expect(await testeeActionButtonPO.isPresent()).toBe(false);
  });

  test('should display actions when dragging view to the center', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'center'}, {performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view quickly to the center', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'center'}, {steps: 1, performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view to the north', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'north'}, {performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view quickly to the north', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'north'}, {steps: 1, performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view to the east', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'east'}, {performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view quickly to the east', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'east'}, {steps: 1, performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view to the south', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'south'}, {performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view quickly to the south', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'south'}, {steps: 1, performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view to the west', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'west'}, {performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions when dragging view quickly to the west', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'west'}, {steps: 1, performDrop: false});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions after drop', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'south'});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });

  test('should display actions after drop when dragging quickly', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const openNewTabActionButtonPO = appPO.activePart.action({cssClass: 'e2e-open-new-tab'});

    // Open a view
    const viewPO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag the view
    await viewPO.viewTabPO.dragToPart({region: 'south'}, {steps: 1});

    // Expect action to display
    await expect(await openNewTabActionButtonPO.isVisible()).toBe(true);
  });
});
