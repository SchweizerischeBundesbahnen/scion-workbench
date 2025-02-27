/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {WorkbenchLayout} from '../layout/workbench-layout';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout.factory';
import {Signal} from '@angular/core';

/**
 * Represents a workbench perspective.
 *
 * A perspective is a named arrangement of views. Different perspectives provide a different perspective on the application.
 * A perspective can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * Views in the main area are retained when switching perspectives.
 */
export interface WorkbenchPerspective {
  /**
   * Unique identifier of this perspective.
   */
  readonly id: string;
  /**
   * Arbitrary data associated with this perspective.
   */
  readonly data: {[key: string]: unknown};
  /**
   * Indicates whether this perspective is active.
   */
  readonly active: Signal<boolean>;
  /**
   * Indicates whether this perspective is transient, with its layout only memoized, not persisted.
   */
  readonly transient: boolean;
}

/**
 * Defines perspectives to register in the workbench.
 *
 * A perspective is a named arrangement of views. Different perspectives provide a different perspective on the application.
 * A perspective can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * Views in the main area are retained when switching perspectives. A perspective cannot add views to the main area.
 */
export interface WorkbenchPerspectives {
  /**
   * Specifies perspectives to register in the workbench.
   */
  perspectives?: WorkbenchPerspectiveDefinition[];
  /**
   * Specifies which perspective to activate. Defaults to the first registered perspective.
   *
   * The workbench remembers the active perspective and only evaluates this property when starting the workbench
   * for the first time, after clearing storage, or if the active perspective no longer exists.
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
   *
   * See {@link WorkbenchLayoutFn} for more information and an example.
   */
  layout: WorkbenchLayoutFn;
  /**
   * Associates arbitrary data with the perspective, e.g., a label, icon or tooltip.
   */
  data?: {[key: string]: unknown};
  /**
   * Decides if the perspective can be activated. The function can call `inject` to get any required dependencies.
   */
  canActivate?: () => Promise<boolean> | boolean;
  /**
   * Defines the perspective as transient, with its layout only memoized, not persisted.
   */
  transient?: true;
}

/**
 * Signature of a function to provide a workbench layout.
 *
 * The workbench will invoke this function with a factory to create the layout. The layout is immutable, so each modification creates a new instance.
 * Use the instance for further modifications and finally return it.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * ## Workbench Layout
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. Each part is a stack of views. Content is displayed in views or parts.
 *
 * The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support
 * the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable
 * area for user interaction.
 *
 * ## Steps to create the layout
 * Start by adding the first part. From there, you can gradually add more parts and align them relative to each other.
 * Next, add views to the layout, specifying to which part to add the views.
 * The final step is to navigate the views. A view can be navigated to any route.
 *
 * To maintain a clean URL, we recommend navigating the parts and views of the initial layout to empty path routes and using a navigation hint to differentiate.
 *
 * ## Example
 * The following example defines a layout with a main area and three parts in the peripheral area:
 *
 * ```plain
 * +--------+----------------+
 * |  top   |   main area    |
 * |  left  |                |
 * |--------+                |
 * | bottom |                |
 * |  left  |                |
 * +--------+----------------+
 * |          bottom         |
 * +-------------------------+
 * ```
 *
 * ```ts
 * function defineLayout(factory: WorkbenchLayoutFactory): WorkbenchLayout {
 *   return factory
 *     // Add parts to the layout.
 *     .addPart(MAIN_AREA)
 *     .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
 *     .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
 *     .addPart('bottom', {align: 'bottom', ratio: .3})
 *
 *     // Add views to the layout.
 *     .addView('navigator', {partId: 'topLeft'})
 *     .addView('explorer', {partId: 'bottomLeft'})
 *     .addView('console', {partId: 'bottom'})
 *     .addView('problems', {partId: 'bottom'})
 *     .addView('search', {partId: 'bottom'})
 *
 *     // Navigate views.
 *     .navigateView('navigator', ['path/to/navigator'])
 *     .navigateView('explorer', ['path/to/explorer'])
 *     .navigateView('console', [], {hint: 'console'}) // Set hint to differentiate between routes with an empty path.
 *     .navigateView('problems', [], {hint: 'problems'}) // Set hint to differentiate between routes with an empty path.
 *     .navigateView('search', ['path/to/search']);
 * }
 * ```
 *
 * The layout requires the following routes.
 *
 * ```ts
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {provideRouter} from '@angular/router';
 * import {canMatchWorkbenchView} from '@scion/workbench';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideRouter([
 *       // Navigator View
 *       {path: 'path/to/navigator', loadComponent: () => import('./navigator/navigator.component')},
 *       // Explorer View
 *       {path: 'path/to/explorer', loadComponent: () => import('./explorer/explorer.component')},
 *       // Search view
 *       {path: 'path/to/search', loadComponent: () => import('./search/search.component')},
 *       // Console view
 *       {path: '', canMatch: [canMatchWorkbenchView('console')], loadComponent: () => import('./console/console.component')},
 *       // Problems view
 *       {path: '', canMatch: [canMatchWorkbenchView('problems')], loadComponent: () => import('./problems/problems.component')},
 *     ]),
 *   ],
 * });
 * ```
 */
export type WorkbenchLayoutFn = (factory: WorkbenchLayoutFactory) => Promise<WorkbenchLayout> | WorkbenchLayout;

/**
 * Signature of a function that can be provided in {@link WorkbenchPerspectives#initialPerspective} to select the perspective for the initial workbench layout.
 *
 * The function is passed a list of registered perspectives. The function can call `inject` to get any required dependencies.
 */
export type WorkbenchPerspectiveSelectionFn = (perspectives: WorkbenchPerspective[]) => Promise<string | undefined> | string | undefined;

/**
 * Contains different versions of a perspective layout.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 *
 * @see WORKBENCH_PERSPECTIVE_MODEL_VERSION
 */
export interface MPerspectiveLayout {
  /**
   * Layout before any user personalization (initial layout).
   */
  referenceLayout: {
    /**
     * @see WorkbenchLayoutSerializer.serializeGrid
     * @see WorkbenchLayoutSerializer.deserializeGrid
     */
    workbenchGrid: string;
    /**
     * @see WorkbenchLayoutSerializer.serializeOutlets
     * @see WorkbenchLayoutSerializer.deserializeOutlets
     */
    outlets: string;
  };
  /**
   * Layout personalized by the user.
   */
  userLayout: {
    /**
     * @see WorkbenchLayoutSerializer.serializeGrid
     * @see WorkbenchLayoutSerializer.deserializeGrid
     */
    workbenchGrid: string;
    /**
     * @see WorkbenchLayoutSerializer.serializeOutlets
     * @see WorkbenchLayoutSerializer.deserializeOutlets
     */
    outlets: string;
  };
}
