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
import {canMatchWorkbenchView, MAIN_AREA, WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchPerspectiveDefinition, WorkbenchRouteData} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';

/**
 * Keys to associate data with a perspective.
 */
export const PerspectiveData = {
  label: 'label',
  tooltip: 'tooltip',
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
        layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA),
      },
      {
        id: 'selection',
        layout: provideSelectionPerspectiveLayout,
        data: {[PerspectiveData.label]: 'Selection'},
      },
      {
        id: 'perspective-1',
        layout: providePerspective1Layout,
        data: {
          [PerspectiveData.label]: 'Perspective 1',
          [PerspectiveData.tooltip]: 'Sample Workbench Perspective',
        },
      },
      {
        id: 'perspective-2',
        layout: providePerspective2Layout,
        data: {
          [PerspectiveData.label]: 'Perspective 2',
          [PerspectiveData.tooltip]: 'Sample Workbench Perspective',
        },
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
          {path: '', canMatch: [canMatchWorkbenchView('sample-view')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Sample View'}},
          {path: '', canMatch: [canMatchWorkbenchView('navigator')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Navigator'}},
          {path: '', canMatch: [canMatchWorkbenchView('package-explorer')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Package Explorer'}},
          {path: '', canMatch: [canMatchWorkbenchView('git-repositories')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Git Repositories'}},
          {path: '', canMatch: [canMatchWorkbenchView('console')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Console'}},
          {path: '', canMatch: [canMatchWorkbenchView('problems')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Problems'}},
          {path: '', canMatch: [canMatchWorkbenchView('search')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Search'}},
          {path: '', canMatch: [canMatchWorkbenchView('outline')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Outline'}},
          {path: '', canMatch: [canMatchWorkbenchView('debug')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Debug'}},
          {path: '', canMatch: [canMatchWorkbenchView('expressions')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Expressions'}},
          {path: '', canMatch: [canMatchWorkbenchView('breakpoints')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Breakpoints'}},
          {path: '', canMatch: [canMatchWorkbenchView('variables')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Variables'}},
          {path: '', canMatch: [canMatchWorkbenchView('servers')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Servers'}},
          {path: '', canMatch: [canMatchWorkbenchView('progress')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Progress'}},
          {path: '', canMatch: [canMatchWorkbenchView('git-staging')], loadComponent: () => import('./view-page/view-page.component'), data: {[WorkbenchRouteData.title]: 'Git Staging'}},
          {path: '', canMatch: [canMatchWorkbenchView('list')], loadComponent: () => import('./selection-module/selection-list-page.component'), data: {[WorkbenchRouteData.title]: 'List'}},
          {path: '', canMatch: [canMatchWorkbenchView('properties')], loadComponent: () => import('./selection-module/properties-page.component'), data: {[WorkbenchRouteData.title]: 'Properties'}},
          {path: '', canMatch: [canMatchWorkbenchView('selection')], loadComponent: () => import('./selection-page/selection-page.component'), data: {[WorkbenchRouteData.title]: 'Selection'}},
          {path: '', canMatch: [canMatchWorkbenchView('inspect-selection')], loadComponent: () => import('./selection-page/selection-inspect-page/selection-inspect-page.component'), data: {[WorkbenchRouteData.title]: 'Inspect Selection'}},
        ]  satisfies Routes,
      },
    ]);
  },
} as const;

function providePerspective1Layout(factory: WorkbenchLayoutFactory): WorkbenchLayout {
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
    .addView('sample-view-5', {partId: 'bottom-right'})
    .addView('sample-view-6', {partId: 'bottom'})
    .addView('sample-view-7', {partId: 'bottom'})
    .addView('sample-view-8', {partId: 'bottom'})
    .navigateView('sample-view-1', [], {hint: 'sample-view'})
    .navigateView('sample-view-2', [], {hint: 'sample-view'})
    .navigateView('sample-view-3', [], {hint: 'sample-view'})
    .navigateView('sample-view-4', [], {hint: 'sample-view'})
    .navigateView('sample-view-5', [], {hint: 'sample-view'})
    .navigateView('sample-view-6', [], {hint: 'sample-view'})
    .navigateView('sample-view-7', [], {hint: 'sample-view'})
    .navigateView('sample-view-8', [], {hint: 'sample-view'});
}

function providePerspective2Layout(factory: WorkbenchLayoutFactory): WorkbenchLayout {
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
    .navigateView('sample-view-1', [], {hint: 'sample-view'})
    .navigateView('sample-view-2', [], {hint: 'sample-view'})
    .navigateView('sample-view-3', [], {hint: 'sample-view'})
    .navigateView('sample-view-4', [], {hint: 'sample-view'})
    .navigateView('sample-view-5', [], {hint: 'sample-view'})
    .navigateView('sample-view-6', [], {hint: 'sample-view'})
    .navigateView('sample-view-7', [], {hint: 'sample-view'})
    .navigateView('sample-view-8', [], {hint: 'sample-view'})
    .navigateView('sample-view-9', [], {hint: 'sample-view'})
    .navigateView('sample-view-10', [], {hint: 'sample-view'});
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
    .navigateView('list-1', [], {hint: 'list'})
    .navigateView('list-2', [], {hint: 'list'})
    .navigateView('properties', [], {hint: 'properties'})
    .navigateView('selection-provider-1', [], {hint: 'selection'})
    .navigateView('selection-provider-2', [], {hint: 'selection'})
    .navigateView('inspect-selection', [], {hint: 'inspect-selection'})
    .navigateView('selection-listener-1', [], {hint: 'selection'})
    .navigateView('selection-listener-2', [], {hint: 'selection'})
    .activateView('list-1')
    .activateView('list-2')
    .activateView('properties')
    .activateView('selection-provider-1')
    .activateView('selection-provider-2')
    .activateView('inspect-selection')
    .activateView('selection-listener-1')
    .activateView('selection-listener-2');
}
