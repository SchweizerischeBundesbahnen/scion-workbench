/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Route, Routes, ROUTES, UrlSegment} from '@angular/router';
import {canMatchWorkbenchPart, canMatchWorkbenchView, MAIN_AREA, WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchPerspectiveDefinition, WorkbenchRouteData} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {ViewSkeletonNavigationData} from './sample-view/sample-view.component';
import {SettingsService} from './settings.service';
import {PartSkeletonNavigationData} from './sample-part/sample-part.component';
import {ProjectComponent} from './project/project.component';
import {SearchComponent} from './search/search.component';
import {BookmarkComponent} from './bookmark/bookmark.component';

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
   * Indicates that a perspective is used in end-to-end tests, displayed only if 'Show Test Perspectives' setting is enabled.
   */
  isTestPerspective: 'isTestPerspective',
} as const;

/**
 * Provides perspective definitions for the workbench testing application.
 */
export const Perspectives = {
  /**
   * Specifies the initial perspective of the testing app.
   */
  initialPerspective: 'blank',

  /**
   * Defines perspectives of the workbench testing app.
   */
  provideDefinitions: (): WorkbenchPerspectiveDefinition[] => {
    return [
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
      {
        id: 'e2e-focus-test-perspective',
        layout: provideFocusTestPerspective,
        data: {
          [PerspectiveData.label]: 'Focus Test Perspective',
          [PerspectiveData.menuItemLabel]: 'Focus Test Perspective',
          [PerspectiveData.menuGroup]: 'test-perspectives',
          [PerspectiveData.isTestPerspective]: true,
        },
      },
      // Create definitions for perspectives defined via query parameter {@link PERSPECTIVES_QUERY_PARAM}.
      ...WorkbenchStartupQueryParams.perspectiveIds().map(perspectiveId => ({
        id: perspectiveId,
        layout: factory => factory.addPart(MAIN_AREA),
      } satisfies WorkbenchPerspectiveDefinition)),
    ];
  },

  /**
   * Provides routes for views arranged in perspectives.
   */
  provideRoutes: (): EnvironmentProviders => {
    return makeEnvironmentProviders([
      {
        provide: ROUTES,
        multi: true,
        useValue: [
          // Sample View
          {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchView('sample-view')(route, segments) && inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./sample-view/sample-view.component'), data: {[WorkbenchRouteData.title]: 'Sample View', [WorkbenchRouteData.heading]: 'Workbench Sample View'}},
          {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchView('sample-view')(route, segments) && !inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Sample View', [WorkbenchRouteData.heading]: 'Workbench Sample View'}},
          // Sample Part
          {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchPart('sample-part')(route, segments) && inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./sample-part/sample-part.component')},
          {path: '', canMatch: [(route: Route, segments: UrlSegment[]) => canMatchWorkbenchPart('sample-part')(route, segments) && !inject(SettingsService).isEnabled('displaySkeletons')], loadComponent: () => import('./part-page/part-page.component')},
          {path: 'project', component: ProjectComponent},
          {path: 'search', component: SearchComponent},
          {path: 'bookmarks', component: BookmarkComponent},
        ] satisfies Routes,
      },
    ]);
  },
} as const;

function provideActivityPerspectiveLayout1(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)
    .addPart('project', {dockTo: 'left-top'}, {icon: 'folder', label: 'Project'})
    .addPart('search', {dockTo: 'left-top'}, {icon: 'search', label: 'Search'})
    .addPart('bookmarks', {dockTo: 'left-bottom'}, {icon: 'bookmark', label: 'Bookmarks'})
    .addPart('terminal', {dockTo: 'bottom-left'}, {icon: 'terminal', label: 'Terminal'})
    .addPart('notifications', {dockTo: 'right-top'}, {icon: 'notifications', label: 'Notifications'})
    .addPart('database', {dockTo: 'right-bottom'}, {icon: 'database', label: 'Database'})
    .addPart('error', {dockTo: 'bottom-right'}, {icon: 'error', label: 'Error'})
    .navigatePart('project', ['project'], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('search', ['search'], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('bookmarks', ['bookmarks'], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    // .navigatePart('terminal', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('notifications', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('database', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('error', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .addView('terminal1', {partId: 'terminal'})
    .addView('terminal2', {partId: 'terminal'})
    .addView('terminal3', {partId: 'terminal'})
    .navigateView('terminal1', ['test-view'])
    .navigateView('terminal2', ['test-view'])
    .navigateView('terminal3', ['test-view'])
    .addView('database1', {partId: 'database'})
    .addView('database2', {partId: 'database'})
    .addView('database3', {partId: 'database'})
    .navigateView('database1', ['test-view'])
    .navigateView('database2', ['test-view'])
    .navigateView('database3', ['test-view'])
    .activatePart('project')
    .activateView('terminal2', {activatePart: true});
}

function provideActivityPerspectiveLayout2(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)
    .addPart('project', {dockTo: 'left-top'}, {icon: 'folder', label: 'Project'})
    .addPart('search', {dockTo: 'left-top'}, {icon: 'search', label: 'Search'})
    .addPart('bookmarks', {dockTo: 'left-bottom'}, {icon: 'bookmark', label: 'Bookmarks'})
    .addPart('terminal', {dockTo: 'bottom-left'}, {icon: 'terminal', label: 'Terminal'})
    .addPart('notifications', {dockTo: 'right-top'}, {icon: 'notifications', label: 'Notifications'})
    .addPart('database', {dockTo: 'right-bottom'}, {icon: 'database', label: 'Database'})
    .addPart('error', {dockTo: 'bottom-right'}, {icon: 'error', label: 'Error'})
    .navigatePart('project', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('search', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('bookmarks', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('terminal', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('notifications', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('database', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .navigatePart('error', [], {hint: 'sample-part', data: {style: 'form'} satisfies PartSkeletonNavigationData})
    .addView('terminal1', {partId: 'terminal'})
    .addView('terminal2', {partId: 'terminal'})
    .addView('terminal3', {partId: 'terminal'})
    .navigateView('terminal1', ['test-view'])
    .navigateView('terminal2', ['test-view'])
    .navigateView('terminal3', ['test-view'])
    .activatePart('project')
    .activateView('terminal2', {activatePart: true});
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

function provideFocusTestPerspective(factory: WorkbenchLayoutFactory): WorkbenchLayout {
  return factory
    .addPart(MAIN_AREA)
    .navigatePart(MAIN_AREA, ['test-pages/focus-test-page'])

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

    // Add Activity logging the active workbench element.
    .addPart('part.log', {dockTo: 'bottom-right'}, {label: 'Active Workbench Element Log', icon: 'terminal', cssClass: 'e2e-log'})
    .navigatePart('part.log', ['active-workbench-element-log'])

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
