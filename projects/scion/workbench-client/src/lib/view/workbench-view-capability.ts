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
 * Represents a microfrontend for display in a workbench view.
 *
 * A view is a visual workbench element for displaying content stacked or side-by-side.
 *
 * The microfrontend can inject the {@link WorkbenchView} handle to interact with the view, such as setting the title, reading
 * parameters, or closing it.
 *
 * @category View
 * @see WorkbenchView
 * @see WorkbenchRouter
 */
export interface WorkbenchViewCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.View;
  /**
   * Qualifies this view. The qualifier is required for views.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the view.
   *
   * Parameters are available in the path and title for placeholder substitution, or can be read in the microfrontend by injecting the {@link WorkbenchView} handle.
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
     *     "path": "product/:id", // `:id` references a capability parameter
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
     * Specifies the title displayed in the view tab.
     *
     * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
     *
     * Interpolation parameters can reference capability parameters and resolvers using the colon syntax. Resolvers resolve data based on capability parameters.
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
     * Specifies the subtitle displayed in the view tab.
     *
     * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
     *
     * Interpolation parameters can reference capability parameters and resolvers using the colon syntax. Resolvers resolve data based on capability parameters.
     * See {@link resolve} for defining resolvers.
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required":  true}
     *   ],
     *   "properties": {
     *     "heading": "%product_category.title;category=:categoryName", // `:categoryName` references a resolver
     *     "resolve": {
     *       "categoryName": "products/:id/category" // `:id` references a capability parameter
     *     }
     *   }
     * }
     * ```
     */
    heading?: Translatable;
    /**
     * Specifies data resolvers for use in the view title and heading.
     *
     * A resolver defines a topic where a request is sent to resolve data. Topic segments can reference capability parameters using the colon syntax.
     * Resolvers can be referenced in interpolation parameters of {@link title} and {@link heading} using the colon syntax.
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required":  true}
     *   ],
     *   "properties": {
     *     "title": "%product.title;name=:productName", // `:productName` references a resolver
     *     "resolve": {
     *       "productName": "products/:id" // `:id` references a capability parameter
     *     }
     *   }
     * }
     * ```
     */
    resolve?: {[key: string]: string};
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
