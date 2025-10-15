/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, ParamDefinition, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Represents a microfrontend for display in a workbench message box.
 *
 * A message box is a standardized dialog for presenting a message to the user, such as an info, warning or alert,
 * or for prompting the user for confirmation.
 *
 * Displayed on top of other content, a message box blocks interaction with other parts of the application. Multiple message boxes are stacked,
 * and only the topmost message box in each modality stack can be interacted with.
 *
 * The microfrontend can inject the {@link WorkbenchMessageBox} handle to interact with the message box, such as reading parameters or signaling readiness.
 *
 * The message box does not automatically adapt its size to the content. Refer to {@link WorkbenchMessageBoxCapability.properties.size} for more information.
 *
 * @category MessageBox
 * @see WorkbenchMessageBox
 * @see WorkbenchMessageBoxService
 */
export interface WorkbenchMessageBoxCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.MessageBox;
  /**
   * Qualifies this message box. The qualifier is required for a message box.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the message box.
   *
   * Parameters can be read in the microfrontend by injecting the {@link WorkbenchMessageBox} handle, or referenced in the path using the colon syntax.
   *
   * @inheritDoc
   */
  params?: ParamDefinition[];
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
     * Specifies the size of the message box.
     *
     * The message box does not automatically adapt its size to the content (only for message boxes provided by the host). Specify a fixed size in
     * the capability or report it from the microfrontend using {@link @scion/microfrontend-platform!PreferredSizeService}. If reporting it from the
     * microfrontend, consider also specifying the size in the capability to avoid flickering, as the microfrontend may take some time to load.
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
     * Specifies CSS class(es) to add to the message box, e.g., to locate the message box in tests.
     */
    cssClass?: string | string[];
    /**
     * Arbitrary metadata associated with the capability.
     */
    [key: string]: unknown;
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
 * Parameter name for the message displayed in the built-in text {@link WorkbenchMessageBoxCapability}.
 */
export const eMESSAGE_BOX_MESSAGE_PARAM = 'message';
