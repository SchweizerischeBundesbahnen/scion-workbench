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
import {expectPart} from '../matcher/part-matcher';
import {PartPagePO} from './page-object/part-page.po';
import {MPart} from '../matcher/to-equal-workbench-layout.matcher';

test.describe('Activity Layout Maximize', () => {

  test('should minimize / maximize activities (layout with main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
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
      .addView('view.100', {partId: 'part.initial'})
      .navigateView('view.100', ['test-view']),
    );
    const viewInMainArea = appPO.view({viewId: 'view.100'});

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);

    // Minimize activities
    await viewInMainArea.tab.dblclick();

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();

    // Restore minimized activities
    await viewInMainArea.tab.dblclick();

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-3'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
  });

  test('should minimize / maximize activities (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.100', {partId: 'part.main'})
      .navigateView('view.100', ['test-view'])
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6'),
    );

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);

    // minimize activities
    const viewPage = appPO.view({viewId: 'view.100'});
    await viewPage.tab.dblclick();

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();

    // restore minimized activities
    await viewPage.tab.dblclick();

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-3'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
  });

  test('should not minimize activities when double clicking tab in activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.101', {partId: 'part.main'})
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .addView('view.102', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
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

    // Try to minimize activities
    await appPO.view({viewId: 'view.102'}).tab.dblclick();

    // Except activities not to be minimized
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
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

  test('should restore minimized activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6'),
    );

    // open view.100
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.100', {partId: 'part.initial'})
      .navigateView('view.100', ['test-view']),
    );
    const viewPage = appPO.view({viewId: 'view.100'});

    // minimize activities (memoized activities: 1, 2, 3, 4, 5, 6)
    await viewPage.tab.dblclick();

    // activate activity.1 (memoized activities do not change)
    const activityItem1 = appPO.activityItem({activityId: 'activity.1'});
    await activityItem1.click();

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();

    // deactivate activity.1
    await activityItem1.click();

    // restore minimized activities (memoized activities 1, 2, 3, 4, 5, 6 are restored)
    await viewPage.tab.dblclick();

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'activity.2',
          },
          rightTop: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
            ],
            activeActivityId: 'activity.3',
          },
          rightBottom: {
            activities: [
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'activity.4',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
            ],
            activeActivityId: 'activity.5',
          },
          bottomRight: {
            activities: [
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
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

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
  });

  test('should not minimize activities when double clicking view close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Open view.101 and view.102
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.101', {partId: 'part.initial'})
      .addView('view.102', {partId: 'part.initial'}),
    );

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
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

    // Double click view close button
    const tab = appPO.view({viewId: 'view.102'}).tab;
    await tab.closeButton.dblclick();

    // Except activities not to be minimized
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
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
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Open view.101 and view.102
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.101', {partId: 'part.initial'})
      .addView('view.102', {partId: 'part.initial'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab1.setTitle('title');
    await tab2.setTitle('title title title'); // longer title than tab 1

    // Assert layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
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

    // Double click close button of tab 1
    await tab1.closeButton.dblclick();

    // Except activities not to be minimized
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
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
});
