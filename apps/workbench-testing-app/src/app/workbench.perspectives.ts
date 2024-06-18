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
