/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {ActivityId} from '../workbench.identifiers';

/**
 * Defines a perspective in the SCION Workbench.
 *
 * A perspective defines an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other.
 * Views are stacked in parts. Content can be displayed in both parts and views.
 *
 * Users can personalize the layout of a perspective and switch between perspectives. The workbench remembers the layout of a perspective,
 * restoring it the next time it is activated.
 *
 * A typical perspective has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to support
 * the user's workflow. The main area part is where the workbench opens views by default and is shared between perspectives. Its layout is
 * not reset when resetting perspectives.
 *
 * Each part must be assigned a unique ID. The ID is used to align parts relative to each other, open views in a specific part, and, if `main-area`,
 * mark the part as the main area part.
 *
 * A part references a part capability that specifies its content, either a microfrontend, a stack of views, or both. If both, the microfrontend
 * is displayed only if the view stack is empty. Views in a docked part cannot be dragged into or out of docked parts.
 *
 * Declaring an intention allows for referencing public part capabilities of other applications. If a part capability cannot be resolved, the part
 * is omitted, allowing conditional display, for example, based on user permissions.
 *
 * @example - Main area with two docked parts
 * ```json
 * {
 *   "type": "perspective",
 *   "qualifier": {
 *     "perspective": "sample-perspective"
 *   },
 *   "properties": {
 *     "parts": [
 *       {
 *         "id": "main-area",
 *         "qualifier": {"part": "main-area"}
 *       },
 *       {
 *         "id": "navigator",
 *         "qualifier": {"part": "navigator"},
 *         "position": "left-top"
 *       },
 *       {
 *         "id": "find",
 *         "qualifier": {"part": "find"},
 *         "position": "bottom-left",
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * Layout of above definition:
 *
 * ```plain
 * +-+------------+-----------------+
 * |x| navigator  |    main-area    |
 * | | (left-top) |                 |
 * | |            |                 |
 * | |            |                 |
 * | |------------+-----------------|
 * |x| find (bottom-left)           |
 * +-+------------------------------+
 * ```
 *
 * @example - Main area with a part aligned relative to a docked part
 *
 * ```json
 * {
 *   "type": "perspective",
 *   "qualifier": {
 *     "perspective": "sample-perspective"
 *   },
 *   "properties": {
 *     "parts": [
 *       {
 *         "id": "main-area",
 *         "qualifier": {"part": "main-area"}
 *       },
 *       {
 *         "id": "navigator",
 *         "qualifier": {"part": "navigator"},
 *         "position": "left-top"
 *       },
 *       {
 *         "id": "detail",
 *         "qualifier": {"part": "detail"},
 *         "position": {"align": "bottom", "relativeTo": "navigator"}
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * Layout of above definition:
 *
 * ```plain
 * +-+------------+-----------------+
 * |x| navigator  |    main-area    |
 * | | (left-top) |                 |
 * | |            |                 |
 * | |------------+                 |
 * | | detail     |                 |
 * | | (bottom of |                 |
 * | | navigator) |                 |
 * +-+------------+-----------------+
 * ```
 *
 * @example - Main area with parts aligned relative to the main area
 * ```json
 * {
 *   "type": "perspective",
 *   "qualifier": {
 *     "perspective": "sample-perspective"
 *   },
 *   "properties": {
 *     "parts": [
 *       {
 *         "id": "main-area",
 *         "qualifier": {"part": "main-area"}
 *       },
 *       {
 *         "id": "navigator",
 *         "qualifier": {"part": "navigator"},
 *         "position": {"align": "left", "relativeTo": "main-area", "ratio": 0.25}
 *       },
 *       {
 *         "id": "find",
 *         "qualifier": {"part": "find"},
 *         "position": {"align": "bottom", "relativeTo": "main-area"}
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * Layout of above definition:
 *
 * ```plain
 * +------------+---------------+
 * | navigator  |   main-area   |
 * | (left of   |               |
 * | main-area) |               |
 * |            |               |
 * |            +---------------+
 * |            |     find      |
 * |            |  (bottom of   |
 * |            |  main-area)   |
 * +------------+---------------+
 * ```
 */
export interface WorkbenchPerspectiveCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.Perspective;
  /**
   * Qualifies this perspective. The qualifier is required for a perspective.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * @inheritDoc
   */
  properties: {
    /**
     * Defines the arrangement of parts.
     *
     * Parts can be docked to the side or positioned relative to each other.
     *
     * The first part cannot be positioned and is typically the main area part. The main area part
     * is a special part with `main-area` as its id. The main area is where the workbench opens views
     * by default. It is shared between perspectives and its layout is not reset when resetting perspectives.
     */
    parts: [
      Omit<WorkbenchPartRef, 'position'>,
      ...WorkbenchPartRef[],
    ];
    /**
     * Associates arbitrary data with the perspective, e.g., a label, icon or tooltip.
     *
     * The workbench host application can read associated data plus metadata about the perspective from {@link WorkbenchPerspective.data}.
     * See {@link WorkbenchPerspectiveData} for metadata set by the SCION Workbench.
     */
    data?: {[key: string]: unknown};
  };
}

/**
 * Describes a part referenced in the perspective.
 */
export interface WorkbenchPartRef {
  /**
   * Identifies the part. Use {@link MAIN_AREA} for the main area part.
   */
  id: string | MAIN_AREA;
  /**
   * Specifies the {@link WorkbenchPartCapability} that provides the content of the part.
   *
   * Declaring an intention allows for referencing public part capabilities of other applications.
   *
   * If the part capability cannot be resolved, the part is omitted, allowing conditional display, for example, based on user permissions.
   */
  qualifier: Qualifier;
  /**
   * Positions the part, either docked or relative to another part.
   */
  position: DockingArea | RelativeTo;
  /**
   * Defines data to pass to the part.
   *
   * The part can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: {[name: string]: unknown};
  /**
   * Controls whether to activate the part.
   */
  active?: boolean;
  /**
   * Specifies CSS class(es) to add to the part, e.g., to locate the part in tests.
   */
  cssClass?: string | string[];
  /**
   * Internal identifier for a docked part.
   *
   * @docs-private Not public API. For internal use only.
   */
  ɵactivityId?: ActivityId;
}

/**
 * Controls where to dock a part.
 *
 * A part can be docked to the left, right, top, or bottom side of the workbench. Docked parts can be minimized to create more space for the main content.
 *
 * Each side has two docking areas: `left-top` and `left-bottom`, `right-top` and `right-bottom`, `top-left` and `top-right`, and `bottom-left` and `bottom-right`.
 * Parts added to the same area are stacked, with only one part active per stack. If there is an active part in both stacks of a side,
 * the two parts are split vertically or horizontally, depending on the side.
 *
 * Docking areas:
 * - `left-top`: Dock to the top on the left side.
 * - `left-bottom`: Dock to the bottom on the left side.
 * - `right-top`: Dock to the top on the right side.
 * - `right-bottom`: Dock to the bottom on the right side.
 * - `top-left`: Dock to the left on the top side.
 * - `top-right`: Dock to the right on the top side.
 * - `bottom-left`: Dock to the left on the bottom side.
 * - `bottom-right`: Dock to the right on the bottom side.
 */
export type DockingArea = 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Describes how to lay out a part relative to another part.
 */
export interface RelativeTo {
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
}

/**
 * Identifies the main area part.
 *
 * The main area is a special part that can be added to the layout. The main area is where the workbench opens views by default.
 * It is shared between perspectives and its layout is not reset when resetting perspectives.
 */
export const MAIN_AREA: MAIN_AREA = 'main-area';

/**
 * Represents the type of the {@link MAIN_AREA} constant.
 */
export type MAIN_AREA = 'main-area';
