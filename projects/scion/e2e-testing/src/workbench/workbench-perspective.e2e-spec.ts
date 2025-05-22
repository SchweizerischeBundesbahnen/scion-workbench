/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {MPart} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('Workbench Perspective', () => {

  test('should support back/forward browser navigation after switching perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create perspective.
    await workbenchNavigator.createPerspective('testee-1', factory => factory.addPart('part.part-1').addView('view.101', {partId: 'part.part-1'}));
    await workbenchNavigator.createPerspective('testee-2', factory => factory.addPart('part.part-2').addView('view.102', {partId: 'part.part-2'}));

    // Switch to perspective 1.
    await appPO.switchPerspective('testee-1');

    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-1');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {root: new MPart({id: 'part.part-1', views: [{id: 'view.101'}]})},
      },
    });

    // Switch to perspective 2.
    await appPO.switchPerspective('testee-2');

    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-2');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {root: new MPart({id: 'part.part-2', views: [{id: 'view.102'}]})},
      },
    });

    // Perform browser history back.
    await appPO.navigateBack();

    // Expect perspective 1 to be active.
    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-1');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {root: new MPart({id: 'part.part-1', views: [{id: 'view.101'}]})},
      },
    });

    // Perform browser history forward.
    await appPO.navigateForward();

    // Expect perspective 2 to be active.
    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-2');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {root: new MPart({id: 'part.part-2', views: [{id: 'view.102'}]})},
      },
    });
  });
});
