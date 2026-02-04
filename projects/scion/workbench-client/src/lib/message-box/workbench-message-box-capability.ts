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
 * Displayed on top of other content, a modal message box blocks interaction with other parts of the application. A message box can be context-modal
 * or application-modal. Message boxes are stacked per modality, with only the topmost message box in each stack being interactive.
 *
 * The microfrontend can inject the `WorkbenchMessageBox` handle (and `ActivatedMicrofrontend` if a host microfrontend) to interact with the message box or access parameters.
 *
 * An explicit size should be defined in {@link WorkbenchMessageBoxCapability.properties.size} unless the message box is provided by the host app, which resizes to fit the content.
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
   * Qualifies the message box. The qualifier is required for a message box.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the message box.
   *
   * Parameters can be read in the microfrontend by injecting the {@link WorkbenchMessageBox} handle (or `ActivatedMicrofrontend` if a host microfrontend).
   * Parameters can also be referenced in the path using the colon syntax.
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
     *
     * ### Empty Path Required if Host Capability
     * Messagebox capabilities of the host application require an empty path. In the route, use `canMatchWorkbenchMessageBoxCapability` guard to match the messagebox capability.
     *
     * @example - Route matching a messagebox capability with qualifier {messagebox: 'alert'}
     * ```ts
     * import {Routes} from '@angular/router';
     * import {canMatchWorkbenchMessageBoxCapability} from '@scion/workbench';
     *
     * const routes: Routes = [
     *   {path: '', canMatch: [canMatchWorkbenchMessageBoxCapability({messagebox: 'alert'})], component: AlertComponent},
     * ];
     * ```
     */
    path: string;
    /**
     * Specifies the size of the message box, recommended if the message box is provided by an application other than the workbench host application.
     */
    size?: WorkbenchMessageBoxSize;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the message box microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * This property is not supported if a host microfrontend.
     *
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
 * Specifies the message box size.
 */
export interface WorkbenchMessageBoxSize {
  /**
   * Specifies the height of the message box, recommended if the message box is provided by an application other than the workbench host application.
   */
  height?: string;
  /**
   * Specifies the width of the message box, recommended if the message box is provided by an application other than the workbench host application.
   */
  width?: string;
  /**
   * Specifies the min-height of the message box.
   */
  minHeight?: string;
  /**
   * Specifies the max-height of the message box.
   */
  maxHeight?: string;
  /**
   * Specifies the min-width of the message box.
   */
  minWidth?: string;
  /**
   * Specifies the max-width of the message box.
   */
  maxWidth?: string;
}
