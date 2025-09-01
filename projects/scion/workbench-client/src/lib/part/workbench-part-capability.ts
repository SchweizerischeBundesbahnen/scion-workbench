/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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
 * A part is a visual element of the workbench layout. Parts can be docked to the side or
 * positioned relative to each other. A part can be a stack of views or display content.
 *
 * The microfrontend can inject the {@link WorkbenchPart} handle to interact with the part.
 *
 * @category Part
 * @see WorkbenchPart
 */
export interface WorkbenchPartCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.Part;
  /**
   * Qualifies this part. The qualifier is required for parts.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the part.
   *
   * Parameters are available in the path and title for placeholder substitution, or can be read in the microfrontend by injecting the {@link WorkbenchPart} handle.
   *
   * @inheritDoc
   */
  params?: ParamDefinition[];
  /**
   * @inheritDoc
   */
  properties?: {
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
    path?: string;
    /**
     * Specifies views to add to the part.
     *
     * Microfrontends provided as view capability can be referenced. Views are added in declaration order.
     *
     * An application can reference public view capabilities of other applications if it manifests a respective intention.
     */
    views?: WorkbenchViewRef[];
    /**
     * Specifies the title displayed in the part bar.
     *
     * Defaults to {@link label} if a docked part. Set to `false` to not display a title.
     *
     * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
     * Interpolation parameters can reference capability parameters and resolvers using the colon syntax. Resolvers resolve data based on capability parameters.
     * See {@link resolve} for defining resolvers.
     */
    title?: Translatable | false;
    /**
     * Controls the appearance and behavior of a docked part.
     *
     * A docked part is a part that is docked to the left, right, or bottom side of the workbench.
     * Docked parts can be minimized to create more space for the main content. Users cannot drag
     * views into or out of docked parts.
     */
    extras?: DockedPartExtras;
    /**
     * Defines resolvers for use in the part title, label and tooltip.
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
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the part microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * Only used if the part displays a microfrontend.
     *
     * @see WorkbenchPart.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to add to the part, e.g., to locate the part in tests.
     */
    cssClass?: string | string[];
    /**
     * Arbitrary metadata associated with the capability.
     */
    [key: string]: unknown;
  };
}

export interface DockedPartExtras {
  /**
   * Specifies the icon of this part.
   *
   * An icon is required for docked parts. Refer to the documentation of the host app for available icons.
   */
  icon: string;
  /**
   * Specifies the label of this part.
   *
   * A label is required if a docked part. The label is displayed in the sidebar for docked parts.
   *
   * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   * Interpolation parameters can reference capability parameters and resolvers using the colon syntax. Resolvers resolve data based on capability parameters.
   * See {@link resolve} for defining resolvers.
   */
  label: Translatable;
  /**
   * Specifies the tooltip of this part.
   *
   * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   * Interpolation parameters can reference capability parameters and resolvers using the colon syntax. Resolvers resolve data based on capability parameters.
   * See {@link resolve} for defining resolvers.
   */
  tooltip?: Translatable;
}

/**
 * Describes a view referenced in a part.
 */
export interface WorkbenchViewRef {
  /**
   * Identifies the view capability.
   */
  qualifier: Qualifier;
  /**
   * Defines data to pass to the view.
   *
   * The view can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: {[name: string]: unknown};
  /**
   * Controls whether to activate the view. If not specified, activates the first view of the part.
   */
  active?: boolean;
  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  cssClass?: string | string[];
}
