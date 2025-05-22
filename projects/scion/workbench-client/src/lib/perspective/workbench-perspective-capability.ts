/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Provides a workbench perspective.
 *
 * A perspective is a named layout. Multiple perspectives can be created. Users can switch between perspectives.
 * Perspectives share the same main area, if any.
 */
export interface WorkbenchPerspectiveCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.Perspective;
  /**
   * Qualifies this perspective. The qualifier is required for perspectives.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * @inheritDoc
   */
  properties: {
    /**
     * Defines the layout of this perspective.
     *
     * A perspective defines an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other.
     * Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.
     *
     * Users can personalize the layout of a perspective and switch between perspectives. The workbench remembers the last layout of each perspective,
     * restoring it the next time it is activated.
     *
     * A perspective typically has a main area part and other parts docked to the side, providing navigation and context-sensitive assistance to support
     * the user's workflow. Initially empty or displaying a welcome page, the main area is where the workbench opens new views by default.
     * Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives.
     *
     * ## Example
     * The following example defines a layout with a main area and three parts:
     *
     * ```plain
     * +--------+----------------+
     * |  top   |                |
     * |  left  |                |
     * |--------+   main area    |
     * | bottom |                |
     * |  left  |                |
     * +--------+----------------+
     * |          bottom         |
     * +-------------------------+
     * ```
     *
     * ```json
     * {
     *   "layout": [
     *     {
     *       "id": "main-area"
     *     },
     *     {
     *       "id": "topLeft",
     *       "align": "left",
     *       "ratio": 0.25,
     *       "views": [
     *         {
     *           "qualifier": {
     *             "view": "navigator"
     *           }
     *         },
     *         {
     *           "qualifier": {
     *             "view": "explorer"
     *           }
     *         }
     *       ]
     *     },
     *     {
     *       "id": "bottomLeft",
     *       "relativeTo": "topLeft",
     *       "align": "bottom",
     *       "ratio": 0.5,
     *       "views": [
     *         {
     *           "qualifier": {
     *             "view": "properties"
     *           }
     *         }
     *       ]
     *     },
     *     {
     *       "id": "bottom",
     *       "align": "bottom",
     *       "ratio": 0.25,
     *       "views": [
     *         {
     *           "qualifier": {
     *             "view": "problems"
     *           }
     *         }
     *       ]
     *     }
     *   ]
     * }
     * ```
     */
    layout: [Pick<WorkbenchPerspectivePart, 'id' | 'views'>, ...WorkbenchPerspectivePart[]];
    /**
     * Arbitrary data associated with this perspective.
     */
    data?: {[key: string]: unknown};
  };
}

/**
 * Represents a part in a workbench perspective.
 *
 * A part is a stack of views that can be arranged in a perspective.
 */
export interface WorkbenchPerspectivePart {
  /**
   * Identifies the part. Use {@link MAIN_AREA} to reference the main area part.
   */
  id: string | MAIN_AREA;
  /**
   * Specifies the part which to use as the reference part to lay out the part.
   * If not set, the part will be aligned relative to the root of the layout.
   */
  relativeTo?: string;
  /**
   * Specifies the side of the reference part where to add the part.
   */
  align: 'left' | 'right' | 'top' | 'bottom';
  /**
   * Specifies the proportional size of the part relative to the reference part.
   * The ratio is the closed interval [0,1]. If not set, defaults to `0.5`.
   */
  ratio?: number;
  /**
   * Defines views to add to the part.
   *
   * Microfrontends provided as view capability can be referenced. Views are added in declaration order.
   * Views cannot be added to the main area part.
   */
  views?: WorkbenchPerspectiveView[];
}

/**
 * Represents a view in a workbench perspective.
 */
export interface WorkbenchPerspectiveView {
  /**
   * Identifies the view capability that provides the microfrontend to add as view.
   *
   * An application can reference the public view capabilities of other applications if it manifests a respective intention.
   */
  qualifier: Qualifier;
  /**
   * Passes data to the view.
   *
   * The view can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: {[name: string]: unknown};
  /**
   * Controls whether to activate the view. If not specified, activates the first view of the part.
   */
  active?: boolean;
  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  cssClass?: string | string[];
}

/**
 * Identifies the main area part in the workbench layout.
 *
 * Refer to this part to align parts relative to the main area.
 *
 * The main area is a special part that can be added to the layout. The main area is where the workbench opens new views by default.
 * It is shared between perspectives and its layout is not reset when resetting perspectives.
 */
export const MAIN_AREA: MAIN_AREA = 'part.main-area';

/**
 * Represents the type of the {@link MAIN_AREA} constant.
 */
export type MAIN_AREA = 'part.main-area';
