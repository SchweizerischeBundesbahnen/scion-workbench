/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {MAIN_AREA} from '../workbench.model';
import {expect} from '@playwright/test';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('Main Area', () => {

  test('should share main area between perspectives', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.main-area-top'});

    // Create perspective 1.
    await workbenchNavigator.createPerspective('perspective.1', factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left', ratio: .25})
      .navigatePart('part.left', ['path/to/part/1']), {activate: false},
    );

    // Create perspective 2.
    await workbenchNavigator.createPerspective('perspective.2', factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right', ratio: .25})
      .navigatePart('part.right', ['path/to/part/2']), {activate: false},
    );

    // Create perspective 3 (no main area).
    await workbenchNavigator.createPerspective('perspective.3', factory => factory
      .addPart('part.main')
      .navigatePart('part.main', ['path/to/part']), {activate: false},
    );

    // Add views to the main area.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.main-area-bottom', {relativeTo: 'part.main-area-top', align: 'bottom'})
      .addView('view.1', {partId: 'part.main-area-top'})
      .addView('view.2', {partId: 'part.main-area-bottom'})
      .addView('view.3', {partId: 'part.main-area-bottom'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', ['path/to/view/2'])
      .navigateView('view.3', ['path/to/view/3'])
      .activateView('view.1')
      .activateView('view.2'),
    );

    await appPO.switchPerspective('perspective.1');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'part.main-area-top',
              views: [{id: 'view.1'}],
            }),
            child2: new MPart({
              id: 'part.main-area-bottom',
              views: [{id: 'view.2'}, {id: 'view.3'}],
            }),
          }),
        },
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({
              id: 'part.left',
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });
    await expect.poll(() => appPO.workbench.view({id: 'view.1'}).then(view => view.navigation.path)).toEqual('path/to/view/1');
    await expect.poll(() => appPO.workbench.view({id: 'view.2'}).then(view => view.navigation.path)).toEqual('path/to/view/2');
    await expect.poll(() => appPO.workbench.view({id: 'view.3'}).then(view => view.navigation.path)).toEqual('path/to/view/3');

    // Switch to perspective 2.
    await appPO.switchPerspective('perspective.2');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'part.main-area-top',
              views: [{id: 'view.1'}],
            }),
            child2: new MPart({
              id: 'part.main-area-bottom',
              views: [{id: 'view.2'}, {id: 'view.3'}],
            }),
          }),
        },
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .75,
            child1: new MPart({
              id: MAIN_AREA,
            }),
            child2: new MPart({
              id: 'part.right',
            }),
          }),
        },
      },
    });
    await expect.poll(() => appPO.workbench.view({id: 'view.1'}).then(view => view.navigation.path)).toEqual('path/to/view/1');
    await expect.poll(() => appPO.workbench.view({id: 'view.2'}).then(view => view.navigation.path)).toEqual('path/to/view/2');
    await expect.poll(() => appPO.workbench.view({id: 'view.3'}).then(view => view.navigation.path)).toEqual('path/to/view/3');

    // Switch to perspective 3 (no main area).
    await appPO.switchPerspective('perspective.3');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            id: 'part.main',
          }),
        },
      },
    });
    await expect.poll(() => appPO.workbench.view({id: 'view.1'}).then(view => view.navigation.path)).toEqual('path/to/view/1');
    await expect.poll(() => appPO.workbench.view({id: 'view.2'}).then(view => view.navigation.path)).toEqual('path/to/view/2');
    await expect.poll(() => appPO.workbench.view({id: 'view.3'}).then(view => view.navigation.path)).toEqual('path/to/view/3');

    // Switch to perspective 1.
    await appPO.switchPerspective('perspective.1');
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'part.main-area-top',
              views: [{id: 'view.1'}],
            }),
            child2: new MPart({
              views: [{id: 'view.2'}, {id: 'view.3'}],
            }),
          }),
        },
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({
              id: 'part.left',
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });
    await expect.poll(() => appPO.workbench.view({id: 'view.1'}).then(view => view.navigation.path)).toEqual('path/to/view/1');
    await expect.poll(() => appPO.workbench.view({id: 'view.2'}).then(view => view.navigation.path)).toEqual('path/to/view/2');
    await expect.poll(() => appPO.workbench.view({id: 'view.3'}).then(view => view.navigation.path)).toEqual('path/to/view/3');
  });
});
