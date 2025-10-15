/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
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
 * A view is a visual element of the workbench layout for displaying content stacked or side-by-side.
 *
 * A view capability can be opened via {@link WorkbenchRouter} or added to a perspective in a {@link WorkbenchPartCapability}.
 *
 * The microfrontend can inject the {@link WorkbenchView} handle to interact with the view.
 *
 * @category View
 * @see WorkbenchView
 */
export interface WorkbenchViewCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.View;
  /**
   * Qualifies this view. The qualifier is required for a view.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the view.
   *
   * Parameters can be read in the microfrontend by injecting the {@link WorkbenchView} handle, or referenced in path, title and resolvers using the colon syntax.
   *
   * @inheritDoc
   */
  params?: ViewParamDefinition[];
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
     * Controls if to load the microfrontend only when activating the view tab.
     *
     * Requires configuration of {@link title} and {@link heading} in the manifest.
     *
     * Defaults to `true`.
     */
    lazy?: boolean;
    /**
     * Specifies the title of the view tab.
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
     * Specifies the subtitle of the view tab.
     *
     * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
     *
     * Text and interpolation parameters can reference capability parameters and resolvers using the colon syntax. See {@link resolve} for defining resolvers.
     *
     * @example - Heading referencing a resolver
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required": true}
     *   ],
     *   "properties": {
     *     "heading": ":productCategory", // `:productCategory` references a resolver
     *     "resolve": {
     *      "productCategory": "products/:id/category" // `:id` references a capability parameter
     *     }
     *   }
     * }
     * ```
     *
     * @example - Translatable heading referencing a resolver in its interpolation parameters
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required": true}
     *   ],
     *   "properties": {
     *     "heading": "%product_category.title;category=:productCategory", // `:productCategory` references a resolver
     *     "resolve": {
     *       "productCategory": "products/:id/category" // `:id` references a capability parameter
     *     }
     *   }
     * }
     * ```
     */
    heading?: Translatable;
    /**
     * Defines resolvers for use in the view title and heading.
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
     * Controls if to display a close button in the view tab. Defaults to `true`.
     */
    closable?: boolean;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the view microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * @see WorkbenchView.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
     */
    cssClass?: string | string[];
    /**
     * Arbitrary metadata associated with the capability.
     */
    [key: string]: unknown;
  };
}

/**
 * Describes a parameter to be passed along with a view intent.
 *
 * @category View
 * @inheritDoc
 */
export interface ViewParamDefinition extends ParamDefinition {
  /**
   * Controls how the workbench router should pass this parameter to the workbench view.
   *
   * By default, parameters are passed via the workbench URL as matrix parameters.
   * Marking a parameter as "transient" instructs the router to pass it via navigational state, useful for large objects.
   *
   * Transient parameters are not persistent, they are only added to the browser's session history to support back/forward browser navigation.
   * Microfrontends must be able to restore state without relying on transient parameters.
   */
  transient?: boolean;
  /**
   * @inheritDoc
   */
  [property: string]: any;
}
