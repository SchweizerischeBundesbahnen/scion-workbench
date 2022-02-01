/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Capability} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {ParamDefinition} from '@scion/microfrontend-platform/lib/platform.model';

/**
 * Represents a microfrontend for display in a workbench view.
 *
 * A view is a visual workbench component for displaying content stacked or arranged side by side in the workbench layout.
 *
 * @category View
 */
export interface WorkbenchViewCapability extends Capability {

  type: WorkbenchCapabilities.View;

  params?: ViewParamDefinition[];

  properties: {
    /**
     * Specifies the path of the microfrontend to be opened when navigating to this view capability.
     *
     * The path is relative to the base URL, as specified in the application manifest. If the
     * application does not declare a base URL, it is relative to the origin of the manifest file.
     *
     * In the path, you can reference qualifier and parameter values in the form of named parameters.
     * Named parameters begin with a colon (`:`) followed by the parameter or qualifier name, and are allowed in path segments, query parameters, matrix parameters
     * and the fragment part. The workbench router will substitute named parameters in the URL accordingly.
     *
     * In addition to using qualifier and parameter values as named parameters in the URL, params are available in the microfrontend via {@link WorkbenchView.params$} Observable.
     *
     * #### Usage of named parameters in the path:
     * ```json
     * {
     *   "type": "view",
     *   "qualifier": {
     *     "entity": "product",
     *     "id": "*",
     *   },
     *   "requiredParams": ["readonly"],
     *   "properties": {
     *     "path": "product/:id?readonly=:readonly",
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
     * Specifies the title to be displayed in the view tab.
     */
    title?: string;
    /**
     * Specifies the sub title to be displayed in the view tab.
     */
    heading?: string;
    /**
     * Specifies if a close button should be displayed in the view tab.
     */
    closable?: boolean;
    /**
     * Specifies CSS class(es) added to the `<wb-view-tab>`, `<wb-view>`, and `<sci-router-outlet>` elements, e.g., to locate the view in e2e tests.
     */
    cssClass?: string | string[];
  };
}

/**
 * Describes a parameter to be passed along with a view intent.
 */
export interface ViewParamDefinition extends ParamDefinition {
  /**
   * Controls how the workbench router should pass the parameter to the workbench view that embeds the microfrontend.
   *
   * By default, the workbench router passes the parameter via the workbench URL as matrix parameter to the workbench view
   * that embeds the microfrontend. By marking the parameter as "transient", you can instruct the workbench router to pass it
   * via navigational state instead of the workbench URL, for example to pass large objects. Since a transient parameter is not
   * included in the workbench URL, it does not survive a page reload, i.e., is only available during the initial navigation of
   * the microfrontend. Consequently, the microfrontend must be able to restore its state without this parameter present.
   */
  transient?: boolean;

  [property: string]: any;
}
