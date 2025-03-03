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
          [PerspectiveData.menuGroup]: 'sample-layout-docked-parts',
        },
      },
      {
        id: 'activity-perspective-2',
        layout: provideActivityPerspectiveLayout2,
        data: {
          [PerspectiveData.label]: 'Sample Layout 2 (Docked Parts)',
          [PerspectiveData.menuItemLabel]: 'Sample Layout 2',
          [PerspectiveData.menuGroup]: 'sample-layout-docked-parts',
        },
      },
      {
        id: 'perspective-1',
        layout: providePerspectiveLayout1,
        data: {
          [PerspectiveData.label]: 'Sample Layout 1 (Peripheral Parts)',
          [PerspectiveData.menuItemLabel]: 'Sample Layout 1',
          [PerspectiveData.menuGroup]: 'sample-layout-peripheral-parts',
        },
      },
      {
        id: 'perspective-2',
        layout: providePerspectiveLayout2,
        data: {
          [PerspectiveData.label]: 'Sample Layout 2 (Peripheral Parts)',
          [PerspectiveData.menuItemLabel]: 'Sample Layout 2',
          [PerspectiveData.menuGroup]: 'sample-layout-peripheral-parts',
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
