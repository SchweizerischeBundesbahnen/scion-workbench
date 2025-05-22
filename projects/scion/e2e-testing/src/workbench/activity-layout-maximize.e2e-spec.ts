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
import {MPart} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('Activity Layout Maximize', () => {

  test('should minimize / maximize activities (layout with main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6'),
    );

    // Open view.100
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.100', {partId: 'part.initial'}),
    );
    const viewInMainArea = appPO.view({viewId: 'view.100'});

    // Expect activities to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'activity.6',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });

    // Minimize activities.
    await viewInMainArea.tab.dblclick();

    // Expect activities to be minimized.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'none',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });

    // Restore minimized activities.
    await viewInMainArea.tab.dblclick();

    // Expect minimized activities to be restored.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'activity.6',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });
  });

  test('should minimize / maximize activities (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.100', {partId: 'part.main'})
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6'),
    );

    // Expect activities to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'activity.6',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({
            id: 'part.main',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });

    // Minimize activities.
    const viewPage = appPO.view({viewId: 'view.100'});
    await viewPage.tab.dblclick();

    // Expect activities to be minimized.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'none',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({
            id: 'part.main',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });

    // Restore minimized activities.
    await viewPage.tab.dblclick();

    // Expect minimized activities to be restored.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'activity.6',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({
            id: 'part.main',
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });
  });

  test('should restore minimized activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6'),
    );

    // Open view.100.
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.100', {partId: 'part.initial'}),
    );
    const viewPage = appPO.view({viewId: 'view.100'});

    // Minimize activities (minimized activities: 1, 2, 3, 4, 5, 6).
    await viewPage.tab.dblclick();

    // Activate activity.1 (minimized activities do not change).
    const activityItem1 = appPO.activityItem({activityId: 'activity.1'});
    await activityItem1.click();

    // Expect activity to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'none',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });

    // Deactivate activity.1.
    await activityItem1.click();

    // Restore minimized activities.
    await viewPage.tab.dblclick();

    // Expect minimized activities to be restored.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'activity.6',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.100'}],
            activeViewId: 'view.100',
          }),
        },
      },
    });
  });

  test('should not minimize activities when double clicking tab in activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    // Expect activity layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({
            id: 'part.main',
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        ['activity.1']: {
          root: new MPart({
            id: 'part.activity-1',
            views: [{id: 'view.102'}],
            activeViewId: 'view.102',
          }),
        },
      },
    });

    // Try to minimize activities.
    await appPO.view({viewId: 'view.102'}).tab.dblclick();

    // Expect activities not to be minimized.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({
            id: 'part.main',
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
        ['activity.1']: {
          root: new MPart({
            id: 'part.activity-1',
            views: [{id: 'view.102'}],
            activeViewId: 'view.102',
          }),
        },
      },
    });
  });

  test('should not minimize activities when double clicking view close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Open view.101 and view.102.
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.101', {partId: 'part.initial'})
      .addView('view.102', {partId: 'part.initial'}),
    );

    // Expect activity layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.101'}, {id: 'view.102'}],
            activeViewId: 'view.101',
          }),
        },
      },
    });

    // Double click view close button.
    const tab = appPO.view({viewId: 'view.102'}).tab;
    await tab.hover();
    await tab.closeButton.dblclick();

    // Expect activities not to be minimized.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.101'}],
            activeViewId: 'view.101',
          }),
        },
      },
    });
  });

  test('should not minimize activities when double clicking view close button (second click on succeeding view tab)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Open view.101 and view.102.
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.101', {partId: 'part.initial'})
      .addView('view.102', {partId: 'part.initial'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab1.setTitle('title');
    await tab2.setTitle('title title title'); // longer title than tab 1

    // Expect activity layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.101'}, {id: 'view.102'}],
            activeViewId: 'view.101',
          }),
        },
      },
    });

    // Double click close button of tab 1.
    await tab1.closeButton.dblclick();

    // Expect activities not to be minimized.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        mainArea: {
          root: new MPart({
            views: [{id: 'view.102'}],
            activeViewId: 'view.102',
          }),
        },
      },
    });
  });

  test('should minimize activity (clicking on minimize button)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Expect activity to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    // Click on minimize button.
    const part = appPO.part({partId: 'part.activity-1'});
    await part.bar.minimizeButton.click();

    // Expect activity to be minimized.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });
  });

  test('should display minimize button only in top-rightmost part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1-bottom', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1'})
      .addPart('part.activity-1-top', {relativeTo: 'part.activity-1-bottom', align: 'top'})
      .addPart('part.activity-1-right', {relativeTo: 'part.activity-1-top', align: 'right'})
      .navigatePart('part.activity-1-bottom', ['test-part'])
      .navigatePart('part.activity-1-top', ['test-part'])
      .navigatePart('part.activity-1-right', ['test-part'])
      .activatePart('part.activity-1-bottom'),
    );

    const partTop = appPO.part({partId: 'part.activity-1-top'});
    const partRight = appPO.part({partId: 'part.activity-1-right'});
    const partBottom = appPO.part({partId: 'part.activity-1-bottom'});

    // Expect minimize button to only be in top-rightmost part.
    await expect(partTop.bar.minimizeButton).not.toBeAttached();
    await expect(partRight.bar.minimizeButton).toBeVisible();
    await expect(partBottom.bar.minimizeButton).not.toBeAttached();

    // Remove top-rightmost part.
    await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-1-right'));

    // Expect minimize button to only be in top-rightmost part.
    await expect(partTop.bar.minimizeButton).toBeVisible();
    await expect(partRight.bar.minimizeButton).not.toBeAttached();
    await expect(partBottom.bar.minimizeButton).not.toBeAttached();

    // Remove top-rightmost part.
    await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-1-top'));

    // Expect minimize button to only be in top-rightmost part.
    await expect(partTop.bar.minimizeButton).not.toBeAttached();
    await expect(partRight.bar.minimizeButton).not.toBeAttached();
    await expect(partBottom.bar.minimizeButton).toBeVisible();
  });

  test('should minimize / maximize activities by pressing Ctrl+Shift+F12', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Expect activities to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1', icon: 'folder', label: 'Activity 1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    // Minimize activities via keystroke.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activities to be minimized.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1', icon: 'folder', label: 'Activity 1'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Restore minimized activities.
    await page.keyboard.press('Control+Shift+F12');

    // Expect minimized activities to be restored.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1', icon: 'folder', label: 'Activity 1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
    });
  });
});
