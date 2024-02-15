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
 * Represents a microfrontend for display in a workbench dialog.
 *
 * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
 * The user can move or resize a dialog.
 *
 * Displayed on top of other content, a dialog blocks interaction with other parts of the application.
 *
 * @category Dialog
 */
export interface WorkbenchDialogCapability extends Capability {

  type: WorkbenchCapabilities.Dialog;

  /**
   * Qualifies this dialog. The qualifier is required for dialogs.
   */
  qualifier: Qualifier;

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
     * Specifies the dialog size.
     */
    size: WorkbenchDialogSize;
    /**
     * Specifies the title of the dialog.
     *
     * You can refer to parameters in the form of named parameters to be replaced during navigation.
     * Named parameters begin with a colon (`:`) followed by the parameter name.
     */
    title?: string;
    /**
     * Specifies if to display a close button in the dialog header. Default is `true`.
     */
    closable?: boolean;
    /**
     * Specifies if the user can resize the dialog. Default is `true`.
     */
    resizable?: boolean;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the dialog microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench as follows:
     *
     * ```ts
     * WorkbenchModule.forRoot({
     *   microfrontendPlatform: {
     *     splash: SplashComponent
     *   }
     * });
     * ```
     *
     * @see WorkbenchDialog.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to be added to the dialog, useful in end-to-end tests for locating the dialog.
     */
    cssClass?: string | string[];
  };
}

/**
 * Represents the dialog size.
 */
export interface WorkbenchDialogSize {
  /**
   * Specifies the height of the dialog.
   */
  height: string;
  /**
   * Specifies the width of the dialog.
   */
  width: string;
  /**
   * Specifies the minimum height of the dialog.
   */
  minHeight?: string;
  /**
   * Specifies the maximum height of the dialog.
   */
  maxHeight?: string;
  /**
   * Specifies the minimum width of the dialog.
   */
  minWidth?: string;
  /**
   * Specifies the maximum width of the dialog.
   */
  maxWidth?: string;
}
