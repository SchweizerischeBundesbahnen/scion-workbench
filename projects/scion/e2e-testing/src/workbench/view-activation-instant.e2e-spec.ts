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

test.describe('View Activation Instant', () => {

  test('should update activation instant of inactive view when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .navigateView('view.1', ['test-view'])
      .navigateView('view.2', ['test-view']),
    );

    const view1 = appPO.view({viewId: 'view.1'});
    const view2 = appPO.view({viewId: 'view.2'});

    // Capture activation instant of 'view.1'.
    await view1.tab.click();
    const view1ActivationInstant = await appPO.view({viewId: 'view.1'}).activationInstant();

    // Capture activation instant of 'view.2'.
    await view2.tab.click();
    const view2ActivationInstant = await appPO.view({viewId: 'view.2'}).activationInstant();

    // Click tab of 'view.1'.
    await view1.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toBeGreaterThan(view1ActivationInstant);

    // Click tab of 'view.2'.
    await view2.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toBeGreaterThan(view2ActivationInstant);
  });

  test('should update activation instant of active but not focused view when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.activity'})
      .navigateView('view.1', ['test-view'])
      .navigateView('view.2', ['test-view'])
      .activatePart('part.activity'),
    );

    const view1 = appPO.view({viewId: 'view.1'});
    const view2 = appPO.view({viewId: 'view.2'});

    // Focus 'view.1'.
    await view1.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

    // Focus 'view.2'.
    await view2.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');

    // Capture activation instants.
    const view1ActivationInstant = await appPO.view({viewId: 'view.1'}).activationInstant();
    const view2ActivationInstant = await appPO.view({viewId: 'view.2'}).activationInstant();

    // Click tab of 'view.1'.
    await view1.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toBeGreaterThan(view1ActivationInstant);

    // Click tab of 'view.2'.
    await view2.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toBeGreaterThan(view2ActivationInstant);
  });

  test('should update activation instant of active but not focused view when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.activity'})
      .navigateView('view.1', ['test-view'])
      .navigateView('view.2', ['test-view'])
      .activatePart('part.activity'),
    );

    // Capture activation instants.
    const view1ActivationInstant = await appPO.view({viewId: 'view.1'}).activationInstant();
    const view2ActivationInstant = await appPO.view({viewId: 'view.2'}).activationInstant();

    // Click content of 'view.1'.
    const view = appPO.view({viewId: 'view.1'});
    await view.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toBeGreaterThan(view1ActivationInstant);

    // Click content of 'view.2'.
    await appPO.view({viewId: 'view.2'}).locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toBeGreaterThan(view2ActivationInstant);
  });

  test('should not update activation instant of active and focused view when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-view']),
    );

    // Focus 'view.1'.
    const view = appPO.view({viewId: 'view.1'});
    await view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

    // Capture activation instant.
    const viewActivationInstant = await appPO.view({viewId: 'view.1'}).activationInstant();
    const navigationId = await appPO.getCurrentNavigationId();

    // Click tab of 'view.1'.
    await view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(viewActivationInstant);
    await expect.poll(() => appPO.getCurrentNavigationId()).toEqual(navigationId);

    // Click tab of 'view.1' again.
    await view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(viewActivationInstant);
    await expect.poll(() => appPO.getCurrentNavigationId()).toEqual(navigationId);
  });

  test('should not update activation instant of active and focused view when clicking part title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main', {title: 'Title'})
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-view']),
    );

    // Focus 'view.1'.
    const view = appPO.view({viewId: 'view.1'});
    await view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

    // Capture activation instant.
    const viewActivationInstant = await appPO.view({viewId: 'view.1'}).activationInstant();

    // Click title of part bar.
    await appPO.part({partId: 'part.main'}).bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(viewActivationInstant);
  });

  test('should not update activation instant of active and focused view when clicking part bar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-view']),
    );

    // Focus 'view.1'.
    const view = appPO.view({viewId: 'view.1'});
    await view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

    // Capture activation instant.
    const viewActivationInstant = await appPO.view({viewId: 'view.1'}).activationInstant();

    // Click part bar.
    await appPO.part({partId: 'part.main'}).bar.filler.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(viewActivationInstant);
  });

  test('should not update activation instant of active and focused view when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-view']),
    );

    // Focus 'view.1'.
    const view = appPO.view({viewId: 'view.1'});
    await view.tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

    // Capture activation instant.
    const viewActivationInstant = await appPO.view({viewId: 'view.1'}).activationInstant();

    // Click content of 'view.1'.
    await view.locator.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toEqual(viewActivationInstant);
  });

  test('should not set activation instant on views of the initial perspective layout (explicit activation)', async ({appPO, workbenchNavigator}) => {
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

    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toBe(0);
    await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toBe(0);
  });

  test('should not set activation instant on views of the initial perspective layout (auto activation)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'}),
    );

    await expect.poll(() => appPO.view({viewId: 'view.1'}).activationInstant()).toBe(0);
    await expect.poll(() => appPO.view({viewId: 'view.2'}).activationInstant()).toBe(0);
  });
});
