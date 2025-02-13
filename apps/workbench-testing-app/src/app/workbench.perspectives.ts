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
        layout: factory => factory.addPart(MAIN_AREA),
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
        layout: factory => factory.addPart(MAIN_AREA),
        data: {[PerspectiveData.label]: perspective.toUpperCase()},
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
        ] satisfies Routes,
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
