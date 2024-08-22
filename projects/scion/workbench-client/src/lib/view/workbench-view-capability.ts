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
     * The path is relative to the base URL specified in the application manifest. If the
     * application does not declare a base URL, it is relative to the origin of the manifest file.
     *
     * The path supports placeholders that will be replaced with parameter values. A placeholder
     * starts with a colon (`:`) followed by the parameter name.
     *
     * Usage:
     * ```json
     * {
     *   "type": "view",
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
     */
    path: string;
    /**
     * Specifies the title of this view.
     *
     * The title supports placeholders that will be replaced with parameter values. A placeholder starts with a colon (`:`) followed by the parameter name.
     * The title can also be set in the microfrontend via {@link WorkbenchView} handle.
     */
    title?: string;
    /**
     * Specifies the subtitle of this view.
     *
     * The heading supports placeholders that will be replaced with parameter values. A placeholder starts with a colon (`:`) followed by the parameter name.
     * The heading can also be set in the microfrontend via {@link WorkbenchView} handle.
     */
    heading?: string;
    /**
     * Specifies if to display a close button in the view tab. Default is `true`.
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
