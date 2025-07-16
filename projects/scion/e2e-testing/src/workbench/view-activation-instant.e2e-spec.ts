/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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

test.describe('View Activation Instant', () => {

  test('should update activation instant of inactive view when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.main'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view']),
    );

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Memoize activation instant of view.101.
    await viewPage1.view.tab.click();
    const view1ActivationInstant = await viewPage1.getActivationInstant();

    // Memoize activation instant of view.102.
    await viewPage2.view.tab.click();
    const view2ActivationInstant = await viewPage2.getActivationInstant();

    // Click tab of view.101.
    await viewPage1.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.101');
    await expect.poll(() => viewPage1.getActivationInstant()).toBeGreaterThan(view1ActivationInstant);

    // Click tab of view.102.
    await viewPage2.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.102');
    await expect.poll(() => viewPage2.getActivationInstant()).toBeGreaterThan(view2ActivationInstant);
  });

  test('should update activation instant of active but not focused view when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      .activatePart('part.activity'),
    );

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Focus view.101
    await viewPage1.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.101');

    // Memoize activation instants.
    const view1ActivationInstant = await viewPage1.getActivationInstant();
    const view2ActivationInstant = await viewPage2.getActivationInstant();

    // Click tab of view.102.
    await viewPage2.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.102');
    await expect.poll(() => viewPage2.getActivationInstant()).toBeGreaterThan(view2ActivationInstant);

    // Click tab of view.101.
    await viewPage1.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.101');
    await expect.poll(() => viewPage1.getActivationInstant()).toBeGreaterThan(view1ActivationInstant);
  });

  test('should update activation instant of active but not focused view when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      .activatePart('part.activity'),
    );

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Focus view.101
    await viewPage1.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.101');

    // Memoize activation instants.
    const view1ActivationInstant = await viewPage1.getActivationInstant();
    const view2ActivationInstant = await viewPage2.getActivationInstant();

    // Click content of view.102.
    await viewPage2.view.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.102');
    await expect.poll(() => viewPage2.getActivationInstant()).toBeGreaterThan(view2ActivationInstant);

    // Click content of view.101.
    await viewPage1.view.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.101');
    await expect.poll(() => viewPage1.getActivationInstant()).toBeGreaterThan(view1ActivationInstant);
  });

  test('should not update activation instant of active and focused view when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.100', {partId: 'part.main'})
      .navigateView('view.100', ['test-view']),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Focus view.100
    await viewPage.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');

    // Memoize activation instant.
    const viewActivationInstant = await viewPage.getActivationInstant();

    // Click tab of view.100.
    await viewPage.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');
    await expect.poll(() => viewPage.getActivationInstant()).toEqual(viewActivationInstant);
  });

  test('should not update activation instant of active and focused view when clicking part title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main', {title: 'Title'})
      .addView('view.100', {partId: 'part.main'})
      .navigateView('view.100', ['test-view']),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Focus view.100
    await viewPage.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');

    // Memoize activation instant.
    const viewActivationInstant = await viewPage.getActivationInstant();

    // Click title of part bar.
    await appPO.part({partId: 'part.main'}).bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');
    await expect.poll(() => viewPage.getActivationInstant()).toEqual(viewActivationInstant);
  });

  test('should not update activation instant of active and focused view when clicking part bar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.100', {partId: 'part.main'})
      .navigateView('view.100', ['test-view']),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Focus view.100
    await viewPage.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');

    // Memoize activation instant.
    const viewActivationInstant = await viewPage.getActivationInstant();

    // Click part bar.
    await appPO.part({partId: 'part.main'}).bar.filler.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');
    await expect.poll(() => viewPage.getActivationInstant()).toEqual(viewActivationInstant);
  });

  test('should not update activation instant of active and focused view when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.100', {partId: 'part.main'})
      .navigateView('view.100', ['test-view']),
    );

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Focus view.100
    await viewPage.view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');

    // Memoize activation instant.
    const viewActivationInstant = await viewPage.getActivationInstant();

    // Click content of view.100.
    await viewPage.view.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.100');
    await expect.poll(() => viewPage.getActivationInstant()).toEqual(viewActivationInstant);
  });
});
