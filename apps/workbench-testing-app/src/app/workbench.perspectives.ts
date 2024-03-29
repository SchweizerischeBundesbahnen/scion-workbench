/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ROUTES} from '@angular/router';
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
        ],
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
    .addPart('findArea', {align: 'right', ratio: .25})
    .activateView('debug')
    .activateView('console')
    .activateView('variables');
}
