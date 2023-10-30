/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Represents a workbench perspective.
 *
 * A perspective is an arrangement of views around the main area.
 *
 * Views can be added to the perspective via {@link WorkbenchPerspectiveExtensionCapability}.
 */
export interface WorkbenchPerspectiveCapability extends Capability {

  type: WorkbenchCapabilities.Perspective;

  properties: {
    /**
     * Represents the parts of this perspective.
     */
    parts: [WorkbenchPerspectiveCapabilityInitialPart, ...WorkbenchPerspectiveCapabilityPart[]];
    /**
     * Arbitrary data associated with this perspective.
     */
    data?: {[key: string]: unknown};
  };
}

export type WorkbenchPerspectiveCapabilityInitialPart = Pick<WorkbenchPerspectiveCapabilityPart, 'id'>;

/**
 * A part is a stack of views that can be arranged in the workbench layout.
 *
 * Views can be added to the part via {@link WorkbenchPerspectiveExtensionCapability}.
 */
export interface WorkbenchPerspectiveCapabilityPart {
  /**
   * Unique identity of this part.
   */
  id: string;
  /**
   * Specifies the part which to use as the reference part to lay out the part.
   * If not set, it is aligned relative to the overall workbench layout.
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
