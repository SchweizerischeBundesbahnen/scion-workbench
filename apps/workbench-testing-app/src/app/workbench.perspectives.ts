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
import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
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
        [PerspectiveData.menuGroup]: 'docked-parts-layout',
      },
    },
    {
      id: 'activity-perspective-2',
      layout: provideActivityPerspectiveLayout2,
      data: {
        [PerspectiveData.label]: 'Sample Layout 2 (Docked Parts)',
        [PerspectiveData.menuItemLabel]: 'Sample Layout 2',
        [PerspectiveData.menuGroup]: 'docked-parts-layout',
      },
    },
    {
      id: 'perspective-1',
      layout: providePerspectiveLayout1,
      data: {
        [PerspectiveData.label]: 'Sample Layout 1 (Peripheral Parts)',
        [PerspectiveData.menuItemLabel]: 'Sample Layout 1',
        [PerspectiveData.menuGroup]: 'peripheral-part-layout',
      },
    },
    {
      id: 'perspective-2',
      layout: providePerspectiveLayout2,
      data: {
        [PerspectiveData.label]: 'Sample Layout 2 (Peripheral Parts)',
        [PerspectiveData.menuItemLabel]: 'Sample Layout 2',
        [PerspectiveData.menuGroup]: 'peripheral-part-layout',
      },
    },
    // Create definitions for perspectives defined via query parameter {@link PERSPECTIVES_QUERY_PARAM}.
    ...WorkbenchStartupQueryParams.perspectiveIds().map(perspectiveId => {
      switch (perspectiveId) {
        case 'e2e-layout-migration-v5': {
          return {
            id: perspectiveId,
            layout: (factory: WorkbenchLayoutFactory) => factory
              .addPart(MAIN_AREA)
              .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
              .navigatePart('part.activity-1', ['test-part'])
              .activatePart('part.activity-1'),
          };
        }
        default: {
          return {
            id: perspectiveId,
            layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA),
          };
        }
      }
    }),
  ] satisfies WorkbenchPerspectiveDefinition[],

  /**
   * Specifies routes used in perspectives of the testing app.
   */
  routes: [
    // Sample View
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchView('sample-view')(route, segments) && inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./sample-view/sample-view.component'), data: {[WorkbenchRouteData.title]: 'Sample View', [WorkbenchRouteData.heading]: 'Workbench Sample View'}},
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchView('sample-view')(route, segments) && !inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Sample View', [WorkbenchRouteData.heading]: 'Workbench Sample View'}},
    // Sample Part
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchPart('sample-part')(route, segments) && inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./sample-part/sample-part.component')},
    {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchPart('sample-part')(route, segments) && !inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./part-page/part-page.component')},
  ] satisfies Routes,
} as const;

function provideActivityPerspectiveLayout1(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    // Add parts to dock areas on the side.
    .addPart(MAIN_AREA)
    .addPart('projects', {dockTo: 'left-top'}, {label: 'Projects', icon: 'folder'})
    .addPart('inbox', {dockTo: 'left-top'}, {icon: 'mail', label: 'Inbox'})
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
    .activatePart('inventory');
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
    .addPart('databases', {dockTo: 'right-top'}, {label: 'Database', icon: 'database'})
    .addPart('connections', {relativeTo: 'databases', align: 'bottom', ratio: .25}, {title: 'Connections'})
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
    .navigatePart('databases', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('servers', [], {hint: 'sample-part', data: {style: 'table'} satisfies PartSkeletonNavigationData})
    .navigatePart('progress', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('connections', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})

    // Navigate views to display content.
    .navigateView('find1', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'lorem'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find2', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'ipsum'`} satisfies ViewSkeletonNavigationData})
    .navigateView('find3', [], {hint: 'sample-view', data: {style: 'list', title: `Occurrences of 'dolor'`} satisfies ViewSkeletonNavigationData})

    .navigateView('terminal1', [], {hint: 'sample-view', data: {style: 'list', title: `Terminal 1`} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal2', [], {hint: 'sample-view', data: {style: 'list', title: `Terminal 2`} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal3', [], {hint: 'sample-view', data: {style: 'list', title: `Terminal 3`} satisfies ViewSkeletonNavigationData})
    .navigateView('terminal4', [], {hint: 'sample-view', data: {style: 'list', title: `Terminal 4`} satisfies ViewSkeletonNavigationData})

    // Activate parts to open docked parts.
    .activatePart('project')
    .activatePart('find')
    .activatePart('databases')
    .activateView('terminal4');
}

function providePerspectiveLayout1(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)
    .addPart('top-right', {align: 'right', ratio: .2})
    .addPart('bottom-right', {relativeTo: 'top-right', align: 'bottom', ratio: .5})
    .addPart('bottom', {align: 'bottom', ratio: .3})
    .addPart('left', {align: 'left', ratio: .15})
    .addView('sample-view-1', {partId: 'left'})
    .addView('sample-view-2', {partId: 'left'})
    .addView('sample-view-3', {partId: 'top-right'})
    .addView('sample-view-4', {partId: 'top-right'})
    .addView('sample-view-5', {partId: 'bottom'})
    .addView('sample-view-6', {partId: 'bottom'})
    .addView('sample-view-7', {partId: 'bottom'})
    .navigatePart('top-right', [], {hint: 'sample-part', data: {style: 'list'} satisfies PartSkeletonNavigationData})
    .navigatePart('bottom-right', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigateView('sample-view-1', [], {hint: 'sample-view', data: {style: 'list', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-2', [], {hint: 'sample-view', data: {style: 'table', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-3', [], {hint: 'sample-view', data: {style: 'table', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-4', [], {hint: 'sample-view', data: {style: 'list', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-5', [], {hint: 'sample-view', data: {style: 'list', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-6', [], {hint: 'sample-view', data: {style: 'form', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-7', [], {hint: 'sample-view', data: {style: 'table', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .activateView('sample-view-7');
}

function providePerspectiveLayout2(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)
    .addPart('top-left', {align: 'left', ratio: .181})
    .addPart('bottom-left', {relativeTo: 'top-left', align: 'bottom', ratio: .5})
    .addPart('right', {align: 'right', ratio: .17})
    .addPart('bottom', {align: 'bottom', ratio: .25})
    .addView('sample-view-1', {partId: 'top-left'})
    .addView('sample-view-2', {partId: 'top-left'})
    .addView('sample-view-3', {partId: 'bottom-left'})
    .addView('sample-view-4', {partId: 'bottom-left'})
    .addView('sample-view-5', {partId: 'right'})
    .addView('sample-view-6', {partId: 'right'})
    .addView('sample-view-7', {partId: 'right'})
    .addView('sample-view-8', {partId: 'bottom'})
    .addView('sample-view-9', {partId: 'bottom'})
    .addView('sample-view-10', {partId: 'bottom'})
    .navigateView('sample-view-1', [], {hint: 'sample-view', data: {style: 'list', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-2', [], {hint: 'sample-view', data: {style: 'table', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-3', [], {hint: 'sample-view', data: {style: 'form', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-4', [], {hint: 'sample-view', data: {style: 'table', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-5', [], {hint: 'sample-view', data: {style: 'list', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-6', [], {hint: 'sample-view', data: {style: 'table', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-7', [], {hint: 'sample-view', data: {style: 'form', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-8', [], {hint: 'sample-view', data: {style: 'list', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-9', [], {hint: 'sample-view', data: {style: 'table', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .navigateView('sample-view-10', [], {hint: 'sample-view', data: {style: 'form', title: 'Sample View'} satisfies ViewSkeletonNavigationData})
    .activateView('sample-view-6');
}
