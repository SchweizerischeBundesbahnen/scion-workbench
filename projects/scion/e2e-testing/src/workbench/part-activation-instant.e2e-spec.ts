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
import {PartPagePO} from './page-object/part-page.po';

test.describe.only('Part Activation Instant', () => {

  test('should update activation instant of inactive part when clicking it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['test-part'])
      .navigatePart('part.right', ['test-part'])
      .activatePart('part.left'),
    );

    const leftPartPage = new PartPagePO(appPO, {partId: 'part.left'});
    const rightPartPage = new PartPagePO(appPO, {partId: 'part.right'});

    // Memoize activation instants.
    const leftPartActivationInstant = await appPO.activationInstant('part.left');
    const rightPartActivationInstant = await appPO.activationInstant('part.right');
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.left');

    // Click part.right.
    await rightPartPage.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => rightPartPage.getActivationInstant()).toBeGreaterThan(rightPartActivationInstant);
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right');

    // Click part.left.
    await leftPartPage.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => leftPartPage.getActivationInstant()).toBeGreaterThan(leftPartActivationInstant);
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.left');
  });

  test('should update activation instant of active but not focused part when clicking it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .navigatePart('part.main', ['test-part'])
      .navigatePart('part.activity', ['test-part'])
      .activatePart('part.activity'),
    );

    const mainPartPage = new PartPagePO(appPO, {partId: 'part.main'});
    const activityPartPage = new PartPagePO(appPO, {partId: 'part.activity'});

    // Memoize activation instants.
    const mainPartActivationInstant = await appPO.activationInstant('part.main');
    const activityPartActivationInstant = await appPO.activationInstant('part.activity');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');

    // Click part.main.
    await mainPartPage.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => mainPartPage.getActivationInstant()).toBeGreaterThan(mainPartActivationInstant);

    // Click part.activity.
    await activityPartPage.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => activityPartPage.getActivationInstant()).toBeGreaterThan(activityPartActivationInstant);
  });

  // Add following tests.
  // should have zero timestamp when adding part, except for the first part (unit tests)
  // should have zero timestamp when adding view, except for the first view of a perspective (unit tests)
  // should update activation instant of active part when activating a view
  // should update activation instant of inactive part when activating a view

  test('should not update activation instant of active and focused view when clicking it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .navigatePart('part.main', ['test-part'])
      .activatePart('part.main'),
    );

    const partPage = new PartPagePO(appPO, {partId: 'part.main'});

    // Memoize activation instant.
    const partActivationInstant = await partPage.getActivationInstant();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');

    // Click part.
    await partPage.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => partPage.getActivationInstant()).toEqual(partActivationInstant);
  });

  test('should not update activation instant of part when switching view tabs', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.main'})
      .addView('view.103', {partId: 'part.main'})
      .navigatePart('part.main', ['test-part']),
    );

    // Memoize activation instant.
    const partActivationInstant = await appPO.activationInstant('part.main');

    // Activate view.101.
    await appPO.view({viewId: 'view.101'}).tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.101');
    await expect.poll(() => appPO.activationInstant('part.main')).toEqual(partActivationInstant);

    // Activate view.102.
    await appPO.view({viewId: 'view.102'}).tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.102');
    await expect.poll(() => appPO.activationInstant('part.main')).toEqual(partActivationInstant);

    // Activate view.103.
    await appPO.view({viewId: 'view.103'}).tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.103');
    await expect.poll(() => appPO.activationInstant('part.main')).toEqual(partActivationInstant);
  });

  test('should update activation instant of part when closing its last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.main'})
      .addView('view.103', {partId: 'part.main'})
      .navigatePart('part.main', ['test-part'])
      .activateView('view.101')
      .activateView('view.102')
      .activateView('view.103'),
    );

    const partActivationInstant = await appPO.activationInstant('part.main');

    // Close view.103.
    await appPO.view({viewId: 'view.103'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.102');
    await expect.poll(() => appPO.activationInstant('part.main')).toEqual(partActivationInstant);

    // Close view.102.
    await appPO.view({viewId: 'view.102'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.101');
    await expect.poll(() => appPO.activationInstant('part.main')).toEqual(partActivationInstant);

    // Close view.101.
    await appPO.view({viewId: 'view.101'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => appPO.activationInstant('part.main')).toBeGreaterThan(partActivationInstant);
  });
});
