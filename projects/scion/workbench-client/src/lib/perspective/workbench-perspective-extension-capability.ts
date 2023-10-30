/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
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
 * Enables extending a workbench perspective with additional views.
 *
 * A perspective can be extended by multiple extensions.
 *
 * Contribution to a perspective of another app, requires the app to declare an intention.
 */
export interface WorkbenchPerspectiveExtensionCapability extends Capability {

  type: WorkbenchCapabilities.PerspectiveExtension;

  properties: {
    /**
     * Qualifies the perspective to extend.
     *
     * Contribution to a perspective of another app, requires the app to declare an intention.
     */
    perspective: Qualifier;
    /**
     * Views to be added to the perspective.
     */
    views: WorkbenchPerspectiveCapabilityView[];
  };
}

/**
 * Represents a workbench view which is added to a perspective.
 */
export interface WorkbenchPerspectiveCapabilityView {
  /**
   * Qualifies this view.
   */
  qualifier: Qualifier;
  /**
   * References the part to which to add the view.
   */
  partId: string;
  /**
   * Specifies the position where to insert the view. The position is zero-based. If not set, adds the view at the end.
   */
  position?: number;
  /**
   * Controls whether to activate the view. If not set, defaults to `false`.
   */
  active?: boolean;
}

