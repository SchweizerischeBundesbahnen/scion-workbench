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
import {ActivityId} from '../workbench.identifiers';

export interface WorkbenchPerspectiveCapability extends Capability {
  type: WorkbenchCapabilities.Perspective;
  qualifier: Qualifier;
  properties: {
    parts: [
      Omit<WorkbenchPartRef, 'position'>,
      ...WorkbenchPartRef[],
    ];
    data?: {[key: string]: unknown};
  };
}

export interface WorkbenchPartRef {
  /**
   * Identifies the part. Use {@link MAIN_AREA} to act as the main area part.
   */
  id: string | MAIN_AREA;
  /**
   * Specifies the part which to use as the reference part to lay out the part.
   * If not set, the part will be aligned relative to the root of the layout.
   */
  position: DockingArea | RelativeTo;
  /**
   * Identifies the part capability.
   */
  qualifier: Qualifier;
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
   * @docs-private Not public API, intended for internal use only.
   */
  ɵactivityId?: ActivityId;
}

export type DockingArea = 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';

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
 * Identifies the main area part in the workbench layout.
 *
 * Refer to this part to align parts relative to the main area.
 *
 * The main area is a special part that can be added to the layout. The main area is where the workbench opens new views by default.
 * It is shared between perspectives and its layout is not reset when resetting perspectives.
 */
export const MAIN_AREA: MAIN_AREA = 'main-area';

/**
 * Represents the type of the {@link MAIN_AREA} constant.
 */
export type MAIN_AREA = 'main-area';
