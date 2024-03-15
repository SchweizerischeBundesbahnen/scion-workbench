/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
 * TODO.
 *
 * @category MessageBox
 */
export interface WorkbenchMessageBoxCapability extends Capability {

  type: WorkbenchCapabilities.MessageBox;

  properties: {
    /**
     * Specifies the path of the microfrontend to be opened when navigating to this dialog capability.
     *
     * The path is relative to the base URL, as specified in the application manifest. If the
     * application does not declare a base URL, it is relative to the origin of the manifest file.
     *
     * In the path, you can reference parameter values in the form of named parameters.
     * Named parameters begin with a colon (`:`) followed by the parameter and are allowed in path segments, query parameters, matrix parameters
     * and the fragment part. The workbench router will substitute named parameters in the URL accordingly.
     *
     * In addition to using parameter values as named parameters in the URL, params are available in the microfrontend via {@link WorkbenchDialog.params} object.
     *
     * #### Usage of named parameters in the path:
     * ```json
     * {
     *   "type": "dialog",
     *   "qualifier": {"entity": "product"},
     *   "params": [
     *     {"name": "id", "required":  true, "description": "Identifies the product."}
     *   ],
     *   "properties": {
     *     "path": "product/:id",
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
     * Specifies the preferred message box size.
     *
     * If not set, the message box will adjust its size to the content size reported by the embedded content using {@link @scion/microfrontend-platform!PreferredSizeService}.
     * Note that the microfrontend may take some time to load, causing the message box to flicker when opened. Therefore, for fixed-sized message boxes,
     * consider declaring the message box size in this capability.
     */
    size?: WorkbenchMessageBoxSize;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the message box microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     * @see WorkbenchMessageBox.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to be added to the dialog, useful in end-to-end tests for locating the dialog.
     */
    cssClass?: string | string[];
  };
}

/**
 * Specifies the preferred message box size.
 */
export interface WorkbenchMessageBoxSize {
  /**
   * Specifies the min-height of the message box.
   */
  minHeight?: string;
  /**
   * Specifies the height of the message box.
   */
  height?: string;
  /**
   * Specifies the max-height of the message box.
   */
  maxHeight?: string;
  /**
   * Specifies the min-width of the message box.
   */
  minWidth?: string;
  /**
   * Specifies the width of the message box.
   */
  width?: string;
  /**
   * Specifies the max-width of the message box.
   */
  maxWidth?: string;
}

/**
 * Parameter name for the message box content of the built-in {@link WorkbenchMessageBoxCapability}.
 *
 * The message box context is only available to microfrontends loaded in a workbench message-box.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export const MESSAGE_BOX_CONTENT_PARAM = 'content';
