/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MAIN_AREA, WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchPerspectiveDefinition} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';

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
        id: 'sample-perspective-1',
        layout: provideLayoutForPerspective1,
        data: {
          [PerspectiveData.label]: 'Sample Perspective 1',
          [PerspectiveData.tooltip]: 'Sample Workbench Perspective',
        },
      },
      {
        id: 'sample-perspective-2',
        layout: provideLayoutForPerspective2,
        data: {
          [PerspectiveData.label]: 'Sample Perspective 2',
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
} as const;

/** @private */
function provideLayoutForPerspective1(factory: WorkbenchLayoutFactory): WorkbenchLayout { // eslint-disable-line no-inner-declarations
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
    .navigateView('sample-view-1', ['skeleton-page', {style: 'list', title: 'Sample View'}])
    .navigateView('sample-view-2', ['skeleton-page', {style: 'form', title: 'Sample View'}])
    .navigateView('sample-view-3', ['skeleton-page', {style: 'list', title: 'Sample View'}])
    .navigateView('sample-view-4', ['skeleton-page', {style: 'table', title: 'Sample View'}])
    .navigateView('sample-view-5', ['skeleton-page', {style: 'form', title: 'Sample View'}])
    .navigateView('sample-view-6', ['skeleton-page', {style: 'table', title: 'Sample View'}])
    .navigateView('sample-view-7', ['skeleton-page', {style: 'form', title: 'Sample View'}])
    .navigateView('sample-view-8', ['skeleton-page', {style: 'list', title: 'Sample View'}])
    .activateView('sample-view-1')
    .activateView('sample-view-3')
    .activateView('sample-view-5')
    .activateView('sample-view-6');
}

/** @private */
function provideLayoutForPerspective2(factory: WorkbenchLayoutFactory): WorkbenchLayout { // eslint-disable-line no-inner-declarations
  return factory
    .addPart(MAIN_AREA)
    .addPart('top-left', {align: 'left', ratio: .181})
    .addPart('bottom-left', {relativeTo: 'top-left', align: 'bottom', ratio: .5})
    .addPart('right', {align: 'right', ratio: .17})
    .addView('sample-view-1', {partId: 'top-left'})
    .addView('sample-view-2', {partId: 'top-left'})
    .addView('sample-view-3', {partId: 'bottom-left'})
    .addView('sample-view-4', {partId: 'bottom-left'})
    .addView('sample-view-5', {partId: 'right'})
    .addView('sample-view-6', {partId: 'right'})
    .addView('sample-view-7', {partId: 'right'})
    .navigateView('sample-view-1', ['skeleton-page', {style: 'list', title: 'Sample View'}])
    .navigateView('sample-view-2', ['skeleton-page', {style: 'form', title: 'Sample View'}])
    .navigateView('sample-view-3', ['skeleton-page', {style: 'table', title: 'Sample View'}])
    .navigateView('sample-view-4', ['skeleton-page', {style: 'table', title: 'Sample View'}])
    .navigateView('sample-view-5', ['skeleton-page', {style: 'table', title: 'Sample View'}])
    .navigateView('sample-view-6', ['skeleton-page', {style: 'list', title: 'Sample View'}])
    .navigateView('sample-view-7', ['skeleton-page', {style: 'form', title: 'Sample View'}])
    .activateView('sample-view-1')
    .activateView('sample-view-3')
    .activateView('sample-view-5');
}
