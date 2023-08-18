/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Observable} from 'rxjs';
import {WorkbenchLayout} from '../layout/workbench-layout';

/**
 * A perspective is an arrangement of views around the main area.
 *
 * Multiple perspectives are supported. Different perspectives provide a different perspective on the application
 * while sharing the main area. Only one perspective can be active at a time.
 */
export interface WorkbenchPerspective {
  /**
   * Unique identifier of this perspective.
   */
  readonly id: string;
  /**
   * Arbitrary data associated with this perspective.
   */
  readonly data: {[key: string]: any};
  /**
   * Indicates whether this perspective is active.
   * There can only be one perspective active at a time.
   */
  readonly active: boolean;
  /**
   * Upon subscription, emits the current active state of this perspective, and then
   * emits continuously when its active state changes. The Observable never completes.
   */
  readonly active$: Observable<boolean>;
}

/**
 * Defines perspectives to register in the workbench.
 *
 * A perspective is an arrangement of views around the main area. Multiple perspectives are supported.
 * Different perspectives provide a different perspective on the application while sharing the main area.
 * Only one perspective can be active at a time.
 */
export interface WorkbenchPerspectives {
  /**
   * Specifies perspectives to register in the workbench.
   */
  perspectives: WorkbenchPerspectiveDefinition[];
  /**
   * Specifies the perspective for the initial workbench layout.
   *
   * Can be either the identity of a perspective or a function to resolve the perspective.
   */
  initialPerspective?: string | WorkbenchPerspectiveSelectionFn;
}

/**
 * Describes a perspective to register in the workbench.
 */
export interface WorkbenchPerspectiveDefinition {
  /**
   * Specifies the unique identity of the perspective.
   */
  id: string;
  /**
   * Function to create the initial layout for the perspective. The function can call `inject` to get any required dependencies.
   */
  layout: WorkbenchLayoutFn;
  /**
   * Associates arbitrary data with the perspective, e.g., a label, icon or tooltip.
   */
  data?: {[key: string]: any};
  /**
   * Decides if the perspective can be activated. The function can call `inject` to get any required dependencies.
   */
  canActivate?: () => Promise<boolean> | boolean;
}

/**
 * Signature of a function to provide the arrangement of views around the main area.
 *
 * The function is passed a layout instance to add parts and views. The layout is an immutable object,
 * meaning that modifications have no side effects. Each modification creates a new layout instance that
 * can be used for further modifications.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * ```ts
 * function defineLayout(layout: WorkbenchLayout): WorkbenchLayout {
 *   return layout.addPart('topLeft', {align: 'left', ratio: .25})
 *                .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
 *                .addPart('bottom', {align: 'bottom', ratio: .3})
 *                .addView('navigator', {partId: 'topLeft', activateView: true})
 *                .addView('explorer', {partId: 'topLeft'})
 *                .addView('repositories', {partId: 'bottomLeft', activateView: true})
 *                .addView('console', {partId: 'bottom', activateView: true})
 *                .addView('problems', {partId: 'bottom'})
 *                .addView('search', {partId: 'bottom'});
 * }
 * ```
 */
export type WorkbenchLayoutFn = (layout: WorkbenchLayout) => Promise<WorkbenchLayout> | WorkbenchLayout;

/**
 * Signature of a function that can be provided in {@link WorkbenchPerspectives#initialPerspective} to select the perspective for the initial workbench layout.
 *
 * The function is passed a list of registered perspectives. The function can call `inject` to get any required dependencies.
 */
export type WorkbenchPerspectiveSelectionFn = (perspectives: WorkbenchPerspective[]) => Promise<WorkbenchPerspective | null> | WorkbenchPerspective | null;
