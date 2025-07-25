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

test.describe('Part Activation Instant', () => {

  test('should update activation instant of inactive part when clicking it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['test-part'])
      .navigatePart('part.right', ['test-part'])
      .activatePart('part.left'),
    );

    const leftPart = appPO.part({partId: 'part.left'});
    const rightPart = appPO.part({partId: 'part.right'});

    // Capture activation instants.
    const leftPartActivationInstant = await appPO.part({partId: 'part.left'}).activationInstant();
    const rightPartActivationInstant = await appPO.part({partId: 'part.right'}).activationInstant();
    await expect.poll(() => appPO.activePart({grid: 'main'}).getPartId()).toEqual('part.left');

    // Click 'part.right'.
    await rightPart.slot.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => appPO.part({partId: 'part.right'}).activationInstant()).toBeGreaterThan(rightPartActivationInstant);
    await expect.poll(() => appPO.activePart({grid: 'main'}).getPartId()).toEqual('part.right');

    // Click 'part.left'.
    await leftPart.slot.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => appPO.part({partId: 'part.left'}).activationInstant()).toBeGreaterThan(leftPartActivationInstant);
    await expect.poll(() => appPO.activePart({grid: 'main'}).getPartId()).toEqual('part.left');
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

    const mainPart = appPO.part({partId: 'part.main'});
    const activityPart = appPO.part({partId: 'part.activity'});

    // Capture activation instants.
    const mainPartActivationInstant = await appPO.part({partId: 'part.main'}).activationInstant();
    const activityPartActivationInstant = await appPO.part({partId: 'part.activity'}).activationInstant();
    await expect.poll(() => appPO.focusOwner()).toBeNull();

    // Click 'part.main'.
    await mainPart.slot.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toBeGreaterThan(mainPartActivationInstant);

    // Click 'part.activity'.
    await activityPart.slot.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => appPO.part({partId: 'part.activity'}).activationInstant()).toBeGreaterThan(activityPartActivationInstant);
  });

  test('should not update activation instant of active and focused part when clicking it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .navigatePart('part.main', ['test-part'])
      .activatePart('part.main'),
    );

    const mainPart = appPO.part({partId: 'part.main'});

    // Focus 'part.main'.
    await appPO.part({partId: 'part.main'}).bar.filler.click();

    // PRECONDITION: Expect 'part.main' to be active and focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();

    // Capture activation instant.
    const mainPartActivationInstant = await appPO.part({partId: 'part.main'}).activationInstant();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');

    // Click 'part.main'.
    await mainPart.slot.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toEqual(mainPartActivationInstant);
  });

  test('should update activation instant of part when switching view tabs', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .addView('view.3', {partId: 'part.main'})
      .navigatePart('part.main', ['test-part']),
    );

    await test.step('Activate view.1', async () => {
      const partActivationInstantBefore = await appPO.part({partId: 'part.main'}).activationInstant();
      const view1ActivationInstantBefore = await appPO.view({viewId: 'view.1'}).activationInstant();
      const view2ActivationInstantBefore = await appPO.view({viewId: 'view.2'}).activationInstant();
      const view3ActivationInstantBefore = await appPO.view({viewId: 'view.3'}).activationInstant();

      // Activate 'view.1'.
      await appPO.view({viewId: 'view.1'}).tab.click();

      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
      await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toBeGreaterThan(partActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toBeGreaterThan(view1ActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(await appPO.part({partId: 'part.main'}).activationInstant());
      await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toEqual(view2ActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.3'}).activationInstant()).toEqual(view3ActivationInstantBefore);
    });

    await test.step('Activate view.2', async () => {
      const partActivationInstantBefore = await appPO.part({partId: 'part.main'}).activationInstant();
      const view1ActivationInstantBefore = await appPO.view({viewId: 'view.1'}).activationInstant();
      const view2ActivationInstantBefore = await appPO.view({viewId: 'view.2'}).activationInstant();
      const view3ActivationInstantBefore = await appPO.view({viewId: 'view.3'}).activationInstant();

      // Activate 'view.2'.
      await appPO.view({viewId: 'view.2'}).tab.click();

      await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
      await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toBeGreaterThan(partActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(view1ActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toEqual(await appPO.part({partId: 'part.main'}).activationInstant());
      await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toBeGreaterThan(view2ActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.3'}).activationInstant()).toEqual(view3ActivationInstantBefore);
    });

    await test.step('Activate view.3', async () => {
      const partActivationInstantBefore = await appPO.part({partId: 'part.main'}).activationInstant();
      const view1ActivationInstantBefore = await appPO.view({viewId: 'view.1'}).activationInstant();
      const view2ActivationInstantBefore = await appPO.view({viewId: 'view.2'}).activationInstant();
      const view3ActivationInstantBefore = await appPO.view({viewId: 'view.3'}).activationInstant();

      // Activate 'view.3'.
      await appPO.view({viewId: 'view.3'}).tab.click();

      await expect.poll(() => appPO.focusOwner()).toEqual('view.3');
      await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toBeGreaterThan(partActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(view1ActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toEqual(view2ActivationInstantBefore);
      await expect.poll(() => appPO.view({viewId: 'view.3'}).activationInstant()).toEqual(await appPO.part({partId: 'part.main'}).activationInstant());
      await expect.poll(() => appPO.view({viewId: 'view.3'}).activationInstant()).toBeGreaterThan(view3ActivationInstantBefore);
    });
  });

  test('should update activation instant of part when closing its last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .addView('view.3', {partId: 'part.main'})
      .navigatePart('part.main', ['test-part'])
      .activateView('view.1')
      .activateView('view.2')
      .activateView('view.3'),
    );

    const partActivationInstant = await appPO.part({partId: 'part.main'}).activationInstant();

    // Close 'view.3'.
    await appPO.view({viewId: 'view.3'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toEqual(partActivationInstant);

    // Close 'view.2'.
    await appPO.view({viewId: 'view.2'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toEqual(partActivationInstant);

    // Close 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => appPO.part({partId: 'part.main'}).activationInstant()).toBeGreaterThan(partActivationInstant);
  });

  test('should not set activation instant on parts of the initial perspective layout (explicit activation)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'})
      .activatePart('part.right')
      .activateView('view.1')
      .activateView('view.2'),
    );

    await expect.poll(() => appPO.part({partId: 'part.left'}).activationInstant()).toBe(0);
    await expect.poll(() => appPO.part({partId: 'part.right'}).activationInstant()).toBe(0);
  });

  test('should not set activation instant on parts of the initial perspective layout (auto activation)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'}),
    );

    await expect.poll(() => appPO.part({partId: 'part.left'}).activationInstant()).toBe(0);
    await expect.poll(() => appPO.part({partId: 'part.right'}).activationInstant()).toBe(0);
  });
});
