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
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Represents a microfrontend for display in a workbench dialog.
 *
 * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
 * The user can move or resize a dialog.
 *
 * Displayed on top of other content, a dialog blocks interaction with other parts of the application. Multiple dialogs are stacked,
 * and only the topmost dialog in each modality stack can be interacted with.
 *
 * The microfrontend can inject the {@link WorkbenchDialog} handle to interact with the dialog, such as setting the title, reading
 * parameters, or closing it.
 *
 * If provided by the workbench host application, the dialog has a footer and resizes to fit its content. See the documentation of
 * `WorkbenchDialogService` in `@scion/workbench` for more information on adding actions to the footer.
 *
 * Dialogs from other applications must specify their size using {@link WorkbenchDialogCapability.properties.size} and add
 * the footer in the microfrontend.
 *
 * @category Dialog
 * @see WorkbenchDialog
 * @see WorkbenchDialogService
 */
export interface WorkbenchDialogCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.Dialog;
  /**
   * Qualifies this dialog. The qualifier is required for dialogs.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the dialog.
   *
   * Parameters are available in the path and title for placeholder substitution, or can be read in the microfrontend by injecting the {@link WorkbenchDialog} handle.
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
     *     "path": "product/:id", // `:id` references a capability parameter
     *   }
     * }
     * ```
     */
    path: string;
    /**
     * Specifies the size of this dialog, required if this dialog is provided by an application other than the workbench host application.
     */
    size?: WorkbenchDialogSize;
    /**
     * Specifies the title of this dialog.
     *
     * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
     *
     * Interpolation parameters can reference capability parameters or resolvers using the colon syntax. Resolvers resolve data based on capability parameters.
     * See {@link resolve} for defining resolvers.
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required":  true}
     *   ],
     *   "properties": {
     *     "title": "%product.title;name=:productName", // `:productName` references a resolver
     *     "resolve": {
     *       "productName": "products/:id/name" // `:id` references a capability parameter
     *     }
     *   }
     * }
     * ```
     */
    title?: Translatable;
    /**
     * Specifies data resolvers for use in the dialog title.
     *
     * A resolver defines a topic where a request is sent to resolve data. Topic segments can reference capability parameters using the colon syntax.
     * Resolvers can be referenced in interpolation parameters of {@link title} using the colon syntax.
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required":  true}
     *   ],
     *   "properties": {
     *     "title": "%product.title;name=:productName", // `:productName` references a resolver
     *     "resolve": {
     *       "productName": "products/:id/name" // `:id` references a capability parameter
     *     }
     *   }
     * }
     * ```
     */
    resolve?: {[key: string]: string};
    /**
     * Specifies if to display a close button in the dialog header. Defaults to `true`.
     */
    closable?: boolean;
    /**
     * Specifies if the user can resize the dialog. Defaults to `true`.
     */
    resizable?: boolean;
    /**
     * Controls if to apply a padding to the content of the dialog.
     *
     * By default, dialogs provided by the workbench host application have a padding, others do not.
     */
    padding?: boolean;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the dialog microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * @see WorkbenchDialog.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to add to the dialog, e.g., to locate the dialog in tests.
     */
    cssClass?: string | string[];
    /**
     * Arbitrary metadata associated with the capability.
     */
    [key: string]: unknown;
  };
}

/**
 * Specifies the dialog size.
 */
export interface WorkbenchDialogSize {
  /**
   * Specifies the height of the dialog, required if this dialog is provided by an application other than the workbench host application.
   */
  height?: string;
  /**
   * Specifies the width of the dialog, required if this dialog is provided by an application other than the workbench host application.
   */
  width?: string;
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
