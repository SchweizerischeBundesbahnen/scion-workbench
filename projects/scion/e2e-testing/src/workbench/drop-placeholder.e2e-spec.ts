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

test.describe('Drop Placeholder', () => {

  test('should dispose drop placeholder on drop into existing part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.right'}),
    );

    // Drag view.1 to the right part.
    const dragHandle = await appPO.view({viewId: 'view.1'}).tab.startDrag();
    await dragHandle.dragToPart('part.right', {region: 'center'});

    // Expect drop placeholder to be visible.
    await expect(appPO.dropPlaceholder).toBeVisible();

    // Perform drop.
    await dragHandle.drop();

    // Expect drop placeholder to be disposed.
    await expect(appPO.dropPlaceholder).not.toBeAttached();
  });

  test('should dispose drop placeholder on drop into new part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'}),
    );

    // Drag view.1 to a new part to the right.
    const dragHandle = await appPO.view({viewId: 'view.1'}).tab.startDrag();
    await dragHandle.dragToPart('part.main', {region: 'east'});

    // Expect drop placeholder to be visible.
    await expect(appPO.dropPlaceholder).toBeVisible();

    // Perform drop.
    await dragHandle.drop();

    // Expect drop placeholder to be disposed.
    await expect(appPO.dropPlaceholder).not.toBeAttached();
  });

  test('should dispose drop placeholder on cancel', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.right'}),
    );

    // Drag view.1 to the right part.
    const dragHandle = await appPO.view({viewId: 'view.1'}).tab.startDrag();
    await dragHandle.dragToPart('part.right', {region: 'center'});

    // Expect drop placeholder to be visible.
    await expect(appPO.dropPlaceholder).toBeVisible();

    // Cancel drop.
    await dragHandle.cancel();

    // Expect drop placeholder to be disposed.
    await expect(appPO.dropPlaceholder).not.toBeAttached();
  });
});
