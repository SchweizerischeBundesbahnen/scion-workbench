/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
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
 * Represents a microfrontend for display in a workbench popup.
 *
 * A popup is a visual workbench component for displaying content above other content.
 *
 * Unlike views, popups are not part of the persistent workbench navigation, meaning that popups do not survive a page reload.
 *
 * @category Popup
 */
export interface WorkbenchPopupCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.Popup;

  /**
   * Qualifies this popup. The qualifier is required for a popup.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * @inheritDoc
   */
  properties: {
    /**
     * Specifies the path to the microfrontend.
     *
     * The path is relative to the base URL given in the application manifest, or to the origin of the manifest file if no base URL is specified.
     *
     * Path segments can reference capability parameters using the colon syntax.
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required": true}
     *   ],
     *   "properties": {
     *     "path": "products/:id", // `:id` references a capability parameter
     *   }
     * }
     * ```
     */
    path: string;
    /**
     * Specifies the preferred popup size.
     *
     * If not set, the popup will adjust its size to the content size reported by the embedded content using {@link @scion/microfrontend-platform!PreferredSizeService}.
     * Note that the microfrontend may take some time to load, causing the popup to flicker when opened. Therefore, for fixed-sized popups,
     * consider declaring the popup size in the popup capability.
     */
    size?: PopupSize;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the popup microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * @see WorkbenchPopup.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to add to the popup, e.g., to locate the popup in tests.
     */
    cssClass?: string | string[];
    /**
     * Arbitrary metadata associated with the capability.
     */
    [key: string]: unknown;
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
