/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities } from '../workbench-capabilities.enum';

/**
 * Represents a microfrontend for display in a workbench popup.
 *
 * A popup is a visual workbench component for displaying content above other content.
 *
 * Unlike views, popups are not part of the persistent workbench navigation, meaning that popups do not survive a page reload.
 *
 * @category Popup
 */
export interface WorkbenchPopupCapability extends Capability {

  type: WorkbenchCapabilities.Popup;

  properties: {
    /**
     * Specifies the path of the microfrontend to be opened when navigating to this popup capability.
     *
     * The path is relative to the base URL, as specified in the application manifest. If the
     * application does not declare a base URL, it is relative to the origin of the manifest file.
     *
     * In the path, you can reference qualifier and parameter values in the form of named parameters.
     * Named parameters begin with a colon (`:`) followed by the parameter or qualifier name, and are allowed in path segments, query parameters, matrix parameters
     * and the fragment part. The popup router will substitute named parameters in the URL accordingly.
     *
     * In addition to using qualifier and parameter values as named parameters in the URL, params are available in the microfrontend via {@link WorkbenchPopup.params} object.
     *
     * #### Usage of named parameters in the path:
     * ```json
     * {
     *   "type": "popup",
     *   "qualifier": {
     *     "entity": "product",
     *     "id": "*",
     *   },
     *   "requiredParams": ["readonly"],
     *   "properties": {
     *     "path": "product/:id?readonly=:readonly",
     *     ...
     *   }
     * }
     * ```
     *
     * #### Path parameter example:
     * segment/:param1/segment/:param2
     *
     * #### Matrix parameter example:
     * segment/segment;matrixParam1=:param1;matrixParam2=:param2
     *
     * #### Query parameter example:
     * segment/segment?queryParam1=:param1&queryParam2=:param2
     */
    path: string;
    /**
     * Specifies the preferred popup size.
     *
     * If not set, the popup will adjust its size to the content size reported by the embedded content using {@link PreferredSizeService}.
     * Note that the microfrontend may take some time to load, causing the popup to flicker when opened. Therefore, for fixed-sized popups,
     * consider declaring the popup size in the popup capability.
     */
    size?: PopupSize;
    /**
     * Specifies CSS class(es) added to the `<sci-router-outlet>` and popup overlay element, e.g., to locate the popup in e2e tests.
     */
    cssClass?: string | string[];
  };
}

/**
 * Represents the preferred popup size.
 */
export interface PopupSize {
  /**
   * Specifies the min-height of the popup.
   */
  minHeight?: string;
  /**
   * Specifies the height of the popup.
   */
  height?: string;
  /**
   * Specifies the max-height of the popup.
   */
  maxHeight?: string;
  /**
   * Specifies the min-width of the popup.
   */
  minWidth?: string;
  /**
   * Specifies the width of the popup.
   */
  width?: string;
  /**
   * Specifies the max-width of the popup.
   */
  maxWidth?: string;
}
