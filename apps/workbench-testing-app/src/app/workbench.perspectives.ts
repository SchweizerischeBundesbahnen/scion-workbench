/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Route, Routes, UrlSegment} from '@angular/router';
import {canMatchWorkbenchPart, canMatchWorkbenchView, MAIN_AREA, WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchPerspectiveDefinition, WorkbenchRouteData} from '@scion/workbench';
import {inject} from '@angular/core';
import {ViewSkeletonNavigationData} from './sample-view/sample-view.component';
import {SettingsService} from './settings.service';
import {PartSkeletonNavigationData} from './sample-part/sample-part.component';
import {environment} from '../environments/environment';

/**
 * Keys for associating data with a perspective.
 */
export const PerspectiveData = {
  /**
   * Label displayed for the selected perspective in the perspective switcher.
   */
  label: 'label',
  /**
   * Label displayed in the perspective switcher menu.
   */
  menuItemLabel: 'menuItemLabel',
  /**
   * Enables grouping in the perspective switcher menu.
   */
  menuGroup: 'menuGroup',
  /**
   * Controls whether to display the perspective in the perspective switcher menu. Defaults to `true`.
   *
   * Can be a `boolean` or a predicate function. The function can call `inject` to get any required dependencies.
   */
  visible: 'visible',
} as const;

/**
 * Provides perspectives of the SCION Workbench Testing Application.
 */
export const Perspectives = {
  /**
   * Specifies the initial perspective of the testing app.
   */
  initialPerspective: environment.initialPerspective,

  /**
   * Specifies perspectives available in the testing app.
   */
  definitions: [
    {
      id: 'blank',
      layout: factory => factory.addPart(MAIN_AREA),
      data: {
        [PerspectiveData.label]: 'Default Layout',
        [PerspectiveData.menuItemLabel]: 'Default Layout',
        [PerspectiveData.menuGroup]: 'default',
      },
    },
    {
      id: 'activity-perspective-1',
      layout: provideActivityPerspectiveLayout1,
      data: {
        [PerspectiveData.label]: 'Sample Layout 1 (Docked Parts)',
        [PerspectiveData.menuItemLabel]: 'Sample Layout 1',
        [PerspectiveData.menuGroup]: 'docked-part-layout',
      },
    },
    {
      id: 'activity-perspective-2',
      layout: provideActivityPerspectiveLayout2,
      data: {
        [PerspectiveData.label]: 'Sample Layout 2 (Docked Parts)',
        [PerspectiveData.menuItemLabel]: 'Sample Layout 2',
        [PerspectiveData.menuGroup]: 'docked-part-layout',
      },
    },
    {
      id: 'perspective-1',
      layout: providePerspectiveLayout1,
      data: {
        [PerspectiveData.label]: 'Sample Layout 1 (Aligned Parts)',
        [PerspectiveData.menuItemLabel]: 'Sample Layout 1',
        [PerspectiveData.menuGroup]: 'aligned-part-layout',
      },
    },
    {
      id: 'perspective-2',
      layout: providePerspectiveLayout2,
      data: {
        [PerspectiveData.label]: 'Sample Layout 2 (Aligned Parts)',
        [PerspectiveData.menuItemLabel]: 'Sample Layout 2',
        [PerspectiveData.menuGroup]: 'aligned-part-layout',
      },
    },
    {
      id: 'e2e-focus-test-perspective',
      layout: provideFocusTestPerspective,
      data: {
        [PerspectiveData.label]: 'Focus Test Perspective',
        [PerspectiveData.menuItemLabel]: 'Focus Test Perspective',
        [PerspectiveData.menuGroup]: 'test-perspectives',
        [PerspectiveData.visible]: () => inject(SettingsService).isEnabled('showTestPerspectives'),
      },
    },
    {
      id: 'e2e-perspective-with-main-area',
      layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA),
      data: {
        [PerspectiveData.visible]: false,
      },
    },
    {
      id: 'e2e-layout-migration-v5',
      layout: (factory: WorkbenchLayoutFactory) => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .navigatePart('part.activity-1', ['test-part'])
        .activatePart('part.activity-1'),
      data: {
        [PerspectiveData.visible]: false,
      },
    },
  ] satisfies WorkbenchPerspectiveDefinition[],

  /**
   * Specifies routes used in perspectives of the testing app.
   */
  routes: [
    // Sample View
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchView('sample-view')(route, segments) && inject(SettingsService).isEnabled('showSkeletons')], loadComponent: () => import('./sample-view/sample-view.component'), data: {[WorkbenchRouteData.title]: 'Sample View', [WorkbenchRouteData.heading]: 'Workbench Sample View'}},
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchView('sample-view')(route, segments) && !inject(SettingsService).isEnabled('showSkeletons')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Sample View', [WorkbenchRouteData.heading]: 'Workbench Sample View'}},
    // Sample Part
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchPart('sample-part')(route, segments) && inject(SettingsService).isEnabled('showSkeletons')], loadComponent: () => import('./sample-part/sample-part.component')},
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchPart('sample-part')(route, segments) && !inject(SettingsService).isEnabled('showSkeletons')], loadComponent: () => import('./part-page/part-page.component')},
  ] satisfies Routes,
} as const;

function provideActivityPerspectiveLayout1(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    // Add parts to dock areas on the side.
    .addPart(MAIN_AREA)
    .addPart('projects', {dockTo: 'left-top'}, {label: 'Projects', icon: 'folder'})
    .addPart('inbox', {dockTo: 'left-top'}, {label: 'Inbox', icon: 'mail'})
    .addPart('bookmarks', {dockTo: 'left-bottom'}, {icon: 'bookmark', label: 'Bookmarks'})
    .addPart('find', {dockTo: 'bottom-left'}, {label: 'Find', icon: 'search'})
    .addPart('inventory', {dockTo: 'right-top'}, {label: 'Inventory', icon: 'inventory'})
    .addPart('notifications', {dockTo: 'right-top'}, {label: 'Notifications', icon: 'notifications'})
    .addPart('progress', {dockTo: 'bottom-right'}, {label: 'Progress', icon: 'overview'})
    .addPart('problems', {dockTo: 'bottom-right'}, {label: 'Problems', icon: 'error'})

    // Add views to parts.
    .addView('find1', {partId: 'find'})
    .addView('find2', {partId: 'find'})
    .addView('find3', {partId: 'find'})

    // Navigate parts to display content.
    .navigatePart('projects', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('inbox', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('inventory', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('bookmarks', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('notifications', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('progress', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})

    // Navigate views to display content.
    .navigateView('find1', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'lorem'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find2', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'ipsum'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find3', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'dolor'`} satisfies ViewSkeletonNavigationData})

    // Activate parts to open docked parts.
    .activatePart('projects')
    .activatePart('find')
    .activatePart('inventory')

    // Add active workbench element log.
    .addPart('active-workbench-element-log', {dockTo: 'bottom-right'}, {label: 'Active Workbench Element Log', icon: 'terminal'})
    .navigatePart('active-workbench-element-log', [], {hint: 'active-workbench-element-log'});
}

function provideActivityPerspectiveLayout2(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    // Add parts to dock areas on the side.
    .addPart(MAIN_AREA)
    .addPart('project', {dockTo: 'left-top'}, {label: 'Project', icon: 'folder'})
    .addPart('bookmarks', {dockTo: 'left-top'}, {icon: 'bookmark', label: 'Bookmarks'})
    .addPart('repositories', {dockTo: 'left-bottom'}, {icon: 'cloud', label: 'Repositories'})
    .addPart('terminal', {dockTo: 'bottom-left'}, {label: 'Terminal', icon: 'terminal'})
    .addPart('find', {dockTo: 'bottom-left'}, {label: 'Find', icon: 'search'})
    .addPart('commits', {dockTo: 'bottom-left'}, {icon: 'graph_1', label: 'Commits'})
    .addPart('structure', {dockTo: 'right-top'}, {icon: 'category', label: 'Structure'})
    .addPart('servers', {dockTo: 'right-top'}, {icon: 'storage', label: 'Servers'})
    .addPart('problems', {dockTo: 'right-bottom'}, {label: 'Problems', icon: 'error'})
    .addPart('databases', {dockTo: 'right-top'}, {label: 'Databases', icon: 'database'})
    .addPart('connections', {relativeTo: 'databases', align: 'bottom', ratio: .5}, {title: 'Connections'})
    .addPart('progress', {dockTo: 'bottom-right'}, {label: 'Progress', icon: 'overview'})

    // Add views to parts.
    .addView('find1', {partId: 'find'})
    .addView('find2', {partId: 'find'})
    .addView('find3', {partId: 'find'})

    .addView('terminal1', {partId: 'terminal'})
    .addView('terminal2', {partId: 'terminal'})
    .addView('terminal3', {partId: 'terminal'})
    .addView('terminal4', {partId: 'terminal'})

    // Navigate parts to display content.
    .navigatePart('project', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('bookmarks', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('repositories', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('commits', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('structure', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('databases', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('servers', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('progress', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('connections', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})

    // Navigate views to display content.
    .navigateView('find1', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'lorem'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find2', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'ipsum'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find3', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'dolor'`} satisfies ViewSkeletonNavigationData})

    .navigateView('terminal1', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 1'} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal2', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 2'} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal3', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 3'} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal4', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 4'} satisfies ViewSkeletonNavigationData})

    // Activate parts to open docked parts.
    .activatePart('project')
    .activatePart('terminal')
    .activatePart('databases')
    .activateView('terminal3')

    // Add active workbench element log.
    .addPart('active-workbench-element-log', {dockTo: 'bottom-right'}, {label: 'Active Workbench Element Log', icon: 'terminal'})
    .navigatePart('active-workbench-element-log', [], {hint: 'active-workbench-element-log'});
}

function providePerspectiveLayout1(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)
    .addPart('projects', {relativeTo: MAIN_AREA, align: 'left', ratio: .175}, {title: 'Projects'})
    .addPart('inventory', {relativeTo: MAIN_AREA, align: 'right', ratio: .175}, {title: 'Inventory'})
    .addPart('inbox', {relativeTo: 'inventory', align: 'bottom', ratio: .5}, {title: 'Inbox'})
    .addPart('find', {align: 'bottom', ratio: .2}, {title: 'Find'})

    .navigatePart('projects', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('inbox', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('inventory', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})

    .addView('find1', {partId: 'find'})
    .addView('find2', {partId: 'find'})
    .addView('find3', {partId: 'find'})
    .addView('inventory1', {partId: 'inventory'})
    .addView('inventory2', {partId: 'inventory'})

    .navigateView('find1', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'lorem'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find2', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'ipsum'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find3', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'dolor'`} satisfies ViewSkeletonNavigationData})

    .navigateView('inventory1', [], {hint: 'sample-view', data: {style: 'list', title: 'Inventory 1'} satisfies ViewSkeletonNavigationData})
    .navigateView('inventory2', [], {hint: 'sample-view', data: {style: 'list', title: 'Inventory 2 '} satisfies ViewSkeletonNavigationData});
}

function providePerspectiveLayout2(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)
    .addPart('projects', {relativeTo: MAIN_AREA, align: 'left', ratio: .175}, {title: 'Projects'})
    .addPart('databases', {relativeTo: MAIN_AREA, align: 'right', ratio: .2}, {title: 'Databases'})
    .addPart('connections', {relativeTo: 'databases', align: 'bottom', ratio: .5}, {title: 'Connections'})
    .addPart('terminal', {align: 'bottom', ratio: .2}, {title: 'Terminal'})

    .navigatePart('projects', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('databases', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})

    .addView('terminal1', {partId: 'terminal'})
    .addView('terminal2', {partId: 'terminal'})
    .addView('terminal3', {partId: 'terminal'})
    .addView('terminal4', {partId: 'terminal'})
    .addView('connection1', {partId: 'connections'})
    .addView('connection2', {partId: 'connections'})

    .navigateView('terminal1', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 1'} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal2', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 2'} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal3', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 3'} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal4', [], {hint: 'sample-view', data: {style: 'list', title: 'Terminal 4'} satisfies ViewSkeletonNavigationData})

    .navigateView('connection1', [], {hint: 'sample-view', data: {style: 'list', title: 'Connection 1'} satisfies ViewSkeletonNavigationData})
    .navigateView('connection2', [], {hint: 'sample-view', data: {style: 'list', title: 'Connection 2'} satisfies ViewSkeletonNavigationData})

    .activateView('terminal3');
}

function provideFocusTestPerspective(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)

    // Add Activity 1 (grid)
    .addPart('part.activity-1a', {dockTo: 'left-top'}, {label: 'Activity 1', tooltip: 'Activity with a grid', icon: 'folder', ɵactivityId: 'activity.1'})
    .addPart('part.activity-1b', {align: 'bottom', relativeTo: 'part.activity-1a', ratio: .8})
    .addPart('part.activity-1c', {align: 'bottom', relativeTo: 'part.activity-1b', ratio: .7})
    .addPart('part.activity-1d', {align: 'bottom', relativeTo: 'part.activity-1c'})
    .addView('view.101', {partId: 'part.activity-1c'})
    .addView('view.102', {partId: 'part.activity-1c'})
    .addView('view.103', {partId: 'part.activity-1d'})
    .addView('view.104', {partId: 'part.activity-1d'})
    .navigatePart('part.activity-1a', ['test-pages/focus-test-page'])
    .navigatePart('part.activity-1b', ['test-pages/focus-test-page'])
    .navigateView('view.101', ['test-pages/focus-test-page'])
    .navigateView('view.102', ['test-pages/focus-test-page'])
    .navigateView('view.103', ['test-pages/focus-test-page'])
    .navigateView('view.104', ['test-pages/focus-test-page'])

    // Add Activity 2 (part)
    .addPart('part.activity-2', {dockTo: 'left-bottom'}, {label: 'Activity 2', tooltip: 'Activity with a single part', icon: 'folder', ɵactivityId: 'activity.2'})
    .navigatePart('part.activity-2', ['test-pages/focus-test-page'])

    // Add Activity 3 (views)
    .addPart('part.activity-3', {dockTo: 'bottom-left'}, {label: 'Activity 3', tooltip: 'Activity with views', icon: 'folder', ɵactivityId: 'activity.3'})
    .addView('view.301', {partId: 'part.activity-3'})
    .addView('view.302', {partId: 'part.activity-3'})
    .navigateView('view.301', ['test-pages/focus-test-page'])
    .navigateView('view.302', ['test-pages/focus-test-page'])

    // Add active workbench element log.
    .addPart('part.log', {dockTo: 'bottom-right'}, {label: 'Active Workbench Element Log', icon: 'terminal'})
    .navigatePart('part.log', [], {hint: 'active-workbench-element-log'})
    .activatePart('part.log')

    // Add peripheral parts on the right
    .addPart('part.right-1', {align: 'right', ratio: .25}, {title: 'Part 1'})
    .addPart('part.right-2', {align: 'bottom', relativeTo: 'part.right-1', ratio: .8}, {title: 'Part 2'})
    .addPart('part.right-3', {align: 'bottom', relativeTo: 'part.right-2', ratio: .7}, {title: 'Part 3'})
    .addPart('part.right-4', {align: 'bottom', relativeTo: 'part.right-3'}, {title: 'Part 4'})
    .addView('view.201', {partId: 'part.right-3'})
    .addView('view.202', {partId: 'part.right-3'})
    .addView('view.203', {partId: 'part.right-4'})
    .addView('view.204', {partId: 'part.right-4'})
    .navigatePart('part.right-1', ['test-pages/focus-test-page'])
    .navigatePart('part.right-2', ['test-pages/focus-test-page'])
    .navigateView('view.201', ['test-pages/focus-test-page'])
    .navigateView('view.202', ['test-pages/focus-test-page'])
    .navigateView('view.203', ['test-pages/focus-test-page'])
    .navigateView('view.204', ['test-pages/focus-test-page']);
}
