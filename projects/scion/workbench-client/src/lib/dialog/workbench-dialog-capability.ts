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
 * The user can move and resize a dialog.
 *
 * Displayed on top of other content, a modal dialog blocks interaction with other parts of the application. A dialog can be context-modal
 * or application-modal. Dialogs are stacked per modality, with only the topmost dialog in each stack being interactive.
 *
 * The microfrontend can inject the `WorkbenchDialog` handle (and `ActivatedMicrofrontend` if a host microfrontend) to interact with the dialog or access parameters.
 *
 * Dialogs provided by the workbench host application have a footer and resize to fit content. See the documentation of `WorkbenchDialogService`
 * in `@scion/workbench` for more information on adding actions to the footer.
 *
 * Dialogs provided by other applications must specify an explicit size in {@link WorkbenchDialogCapability.properties.size} and add
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
   * Qualifies this dialog. The qualifier is required for a dialog.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the dialog.
   *
   * Parameters can be read in the microfrontend by injecting the {@link WorkbenchDialog} handle, or referenced in path, title and resolvers using the colon syntax.
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
     * Dialog capabilities of the host application require an empty path. In the route, use `canMatchWorkbenchDialogCapability` guard to match the dialog capability.
     *
     * @example - Route matching a dialog capability with qualifier {dialog: 'about'}
     * ```ts
     * import {Routes} from '@angular/router';
     * import {canMatchWorkbenchDialogCapability} from '@scion/workbench';
     *
     * const routes: Routes = [
     *   {path: '', canMatch: [canMatchWorkbenchDialogCapability({dialog: 'about'})], component: AboutComponent},
     * ];
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
     * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
     *
     * Text and interpolation parameters can reference capability parameters and resolvers using the colon syntax. See {@link resolve} for defining resolvers.
     *
     * @example - Title referencing a resolver
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required": true}
     *   ],
     *   "properties": {
     *     "title": ":productName", // `:productName` references a resolver
     *     "resolve": {
     *       "productName": "products/:id/name" // `:id` references a capability parameter
     *     }
     *   }
     * }
     * ```
     *
     * @example - Translatable title referencing a resolver in its interpolation parameters
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required": true}
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
     * Defines resolvers for use in the dialog title.
     *
     * A resolver defines a topic where a request is sent to resolve text or a translation key, typically based on capability parameters. Topic segments can reference capability parameters using the colon syntax.
     *
     * The application can respond to resolve requests by installing a message listener in the activator. Refer to {@link ActivatorCapability} for registering an activator.
     *
     * @example - Message listener replying to resolve requests
     *
     * ```ts
     * import {Beans} from '@scion/toolkit/bean-manager';
     * import {MessageClient} from '@scion/microfrontend-platform';
     *
     * Beans.get(MessageClient).onMessage('products/:id/name', message => {
     *   const id = message.params.get('id');
     *   return `Product ${id}`;
     * });
     * ```
     */
    resolve?: {[name: string]: string};
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
     * This property is not supported if a host microfrontend.
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
