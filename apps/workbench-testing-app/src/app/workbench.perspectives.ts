/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Routes, ROUTES} from '@angular/router';
import {MAIN_AREA, WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchPerspectiveDefinition, WorkbenchRouteData} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';

/**
 * Keys to associate data with a perspective.
 */
export const PerspectiveData = {
  label: 'label',
} as const;

/**
 * Provides perspective definitions for the workbench testing application.
 */
export const Perspectives = {
  /**
   * Specifies the initial perspective of the testing app.
   */
  initialPerspective: 'empty',

  /**
   * Defines perspectives of the workbench testing app.
   */
  provideDefinitions: (): WorkbenchPerspectiveDefinition[] => {
    return [
      {
        id: 'developer',
        layout: provideDeveloperPerspectiveLayout,
        data: {[PerspectiveData.label]: 'Developer'},
      },
      {
        id: 'debug',
        layout: provideDebugPerspectiveLayout,
        data: {[PerspectiveData.label]: 'Debug'},
      },
      {
        id: 'selection',
        layout: provideSelectionPerspectiveLayout,
        data: {[PerspectiveData.label]: 'Selection'},
      },
      {
        id: 'empty',
        layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA),
        data: {[PerspectiveData.label]: 'Empty'},
      },
      // Create definitions for perspectives defined via query parameter {@link PERSPECTIVES_QUERY_PARAM}.
      ...WorkbenchStartupQueryParams.perspectives().map(perspective => ({
        id: perspective,
        layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA),
        data: {[PerspectiveData.label]: perspective.toUpperCase()},
      })),
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
          {path: '', outlet: 'navigator', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Navigator'}},
          {path: '', outlet: 'package-explorer', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Package Explorer'}},
          {path: '', outlet: 'git-repositories', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Git Repositories'}},
          {path: '', outlet: 'console', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Console'}},
          {path: '', outlet: 'problems', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Problems'}},
          {path: '', outlet: 'search', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Search'}},
          {path: '', outlet: 'outline', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Outline'}},
          {path: '', outlet: 'debug', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Debug'}},
          {path: '', outlet: 'expressions', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Expressions'}},
          {path: '', outlet: 'breakpoints', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Breakpoints'}},
          {path: '', outlet: 'variables', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Variables'}},
          {path: '', outlet: 'servers', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Servers'}},
          {path: '', outlet: 'progress', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Progress'}},
          {path: '', outlet: 'git-staging', loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Git Staging'}},
          {path: '', outlet: 'list', loadComponent: () => import('./selection-module/selection-list-page.component'), data: {[WorkbenchRouteData.title]: 'List'}},
          {path: '', outlet: 'properties', loadComponent: () => import('./selection-module/properties-page.component'), data: {[WorkbenchRouteData.title]: 'Properties'}},
          {path: '', outlet: 'selection', loadComponent: () => import('./selection-page/selection-page.component'), data: {[WorkbenchRouteData.title]: 'Selection'}},
          {path: '', outlet: 'inspect-selection', loadComponent: () => import('./selection-page/selection-inspect-page/selection-inspect-page.component'), data: {[WorkbenchRouteData.title]: 'Inspect Selection'}},
        ]  satisfies Routes,
      },
    ]);
  },
} as const;

/** @private */
function provideDeveloperPerspectiveLayout(factory: WorkbenchLayoutFactory): WorkbenchLayout { // eslint-disable-line no-inner-declarations
  return factory
    .addPart(MAIN_AREA)
    .addPart('right', {align: 'right', ratio: .2})
    .addPart('bottom', {align: 'bottom', ratio: .3})
    .addPart('topLeft', {align: 'left', ratio: .125})
    .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
    .addPart('searchArea', {relativeTo: 'right', align: 'bottom', ratio: .5})
    .addPart('findArea', {relativeTo: 'right', align: 'bottom', ratio: .5})
    .addView('package-explorer', {partId: 'topLeft'})
    .addView('navigator', {partId: 'topLeft'})
    .addView('git-repositories', {partId: 'bottomLeft'})
    .addView('problems', {partId: 'bottom'})
    .addView('git-staging', {partId: 'bottom'})
    .addView('console', {partId: 'bottom'})
    .addView('search', {partId: 'bottom'})
    .addView('progress', {partId: 'bottom'})
    .addView('outline', {partId: 'right'})
    .navigateView('package-explorer', [], {outlet: 'package-explorer'})
    .navigateView('navigator', [], {outlet: 'navigator'})
    .navigateView('git-repositories', [], {outlet: 'git-repositories'})
    .navigateView('problems', [], {outlet: 'problems'})
    .navigateView('git-staging', [], {outlet: 'git-staging'})
    .navigateView('console', [], {outlet: 'console'})
    .navigateView('search', [], {outlet: 'search'})
    .navigateView('progress', [], {outlet: 'progress'})
    .navigateView('outline', [], {outlet: 'outline'})
    .activateView('package-explorer')
    .activateView('git-repositories')
    .activateView('console')
    .activateView('outline');
}

/** @private */
function provideDebugPerspectiveLayout(factory: WorkbenchLayoutFactory): WorkbenchLayout { // eslint-disable-line no-inner-declarations
  return factory
    .addPart(MAIN_AREA)
    .addPart('left', {align: 'left', ratio: .147})
    .addPart('bottom', {align: 'bottom', ratio: .3})
    .addPart('right', {align: 'right', ratio: .175})
    .addView('debug', {partId: 'left'})
    .addView('package-explorer', {partId: 'left'})
    .addView('servers', {partId: 'bottom'})
    .addView('console', {partId: 'bottom'})
    .addView('problems', {partId: 'bottom'})
    .addView('variables', {partId: 'right'})
    .addView('expressions', {partId: 'right'})
    .addView('breakpoints', {partId: 'right'})
    .navigateView('debug', [], {outlet: 'debug'})
    .navigateView('package-explorer', [], {outlet: 'package-explorer'})
    .navigateView('servers', [], {outlet: 'servers'})
    .navigateView('console', [], {outlet: 'console'})
    .navigateView('problems', [], {outlet: 'problems'})
    .navigateView('variables', [], {outlet: 'variables'})
    .navigateView('expressions', [], {outlet: 'expressions'})
    .navigateView('breakpoints', [], {outlet: 'breakpoints'})
    .activateView('debug')
    .activateView('console')
    .activateView('variables');
}

/** @private */
function provideSelectionPerspectiveLayout(factory: WorkbenchLayoutFactory): WorkbenchLayout { // eslint-disable-line no-inner-declarations
  return factory
    .addPart('left-top')
    .addPart('left-middle', {align: 'bottom', relativeTo: 'left-top', ratio: .5})
    .addPart('left-bottom', {align: 'bottom', relativeTo: 'left-middle', ratio: .5})
    .addPart('middle-top', {align: 'right', ratio: .4})
    .addPart('middle-bottom', {align: 'bottom', relativeTo: 'middle-top', ratio: .5})
    .addPart('right-top', {align: 'right', ratio: .4})
    .addPart('right-bottom-1', {align: 'bottom', relativeTo: 'right-top', ratio: .5})
    .addPart('right-bottom-2', {align: 'right', relativeTo: 'right-bottom-1', ratio: .5})
    .addView('list-1', {partId: 'left-top'})
    .addView('list-2', {partId: 'left-middle'})
    .addView('properties', {partId: 'left-bottom'})
    .addView('selection-provider-1', {partId: 'middle-top'})
    .addView('selection-provider-2', {partId: 'middle-bottom'})
    .addView('inspect-selection', {partId: 'right-top'})
    .addView('selection-listener-1', {partId: 'right-bottom-1'})
    .addView('selection-listener-2', {partId: 'right-bottom-2'})
    .navigateView('list-1', [], {outlet: 'list'})
    .navigateView('list-2', [], {outlet: 'list'})
    .navigateView('properties', [], {outlet: 'properties'})
    .navigateView('selection-provider-1', [], {outlet: 'selection'})
    .navigateView('selection-provider-2', [], {outlet: 'selection'})
    .navigateView('inspect-selection', [], {outlet: 'inspect-selection'})
    .navigateView('selection-listener-1', [], {outlet: 'selection'})
    .navigateView('selection-listener-2', [], {outlet: 'selection'})
    .activateView('list-1')
    .activateView('list-2')
    .activateView('properties')
    .activateView('selection-provider-1')
    .activateView('selection-provider-2')
    .activateView('inspect-selection')
    .activateView('selection-listener-1')
    .activateView('selection-listener-2');
}
