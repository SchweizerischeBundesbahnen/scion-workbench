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
 * A part is a visual element of the workbench layout. Parts can be docked to the side or positioned relative to each other.
 * A part can display content or stack views.
 *
 * The arrangement of parts is defined in a {@link WorkbenchPerspectiveCapability}. Each part defined in the perspective references
 * a part capability to contribute content, either a microfrontend, a stack of views, or both. If both, the microfrontend is displayed
 * only if the view stack is empty. Views in a docked part cannot be dragged into or out of docked parts.
 *
 * The microfrontend can inject the `WorkbenchPart` handle (and `ActivatedMicrofrontend` if a host microfrontend) to interact with the part or access parameters.
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
   * Qualifies this part. The qualifier is required for a part.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by this part.
   *
   * Parameters can be read in the microfrontend by injecting the {@link WorkbenchPart} handle, or referenced in path, title, label, tooltip and resolvers using the colon syntax.
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
     *     {"name": "read", "required": false}
     *   ],
     *   "properties": {
     *     "path": "tasks?read=:read", // `:read` references a capability parameter
     *   }
     * }
     * ```
     *
     * If the part contains views, the microfrontend is displayed only if the view stack is empty.
     *
     * ### Empty Path Required if Host Capability
     * Part capabilities of the host application require an empty path. In the route, use `canMatchWorkbenchPartCapability` guard to match the part capability.
     *
     * @example - Route matching a part capability with qualifier {part: 'navigator'}
     * ```ts
     * import {Routes} from '@angular/router';
     * import {canMatchWorkbenchPartCapability} from '@scion/workbench';
     *
     * const routes: Routes = [
     *   {path: '', canMatch: [canMatchWorkbenchPartCapability({part: 'navigator'})], component: NavigatorComponent},
     * ];
     */
    path?: string;
    /**
     * Specifies views to stack in the part.
     *
     * Microfrontends provided as view capability can be referenced. Views are stacked in declaration order.
     *
     * Declaring an intention allows for referencing public view capabilities of other applications. If a view capability cannot be resolved, the view
     * is omitted, allowing conditional display, for example, based on user permissions.
     *
     * If a docked part, views cannot be dragged in or out.
     */
    views?: WorkbenchViewRef[];
    /**
     * Specifies the title displayed in the part bar.
     *
     * Defaults to {@link extras.label} if a docked part. Set to `false` to not display a title.
     *
     * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
     *
     * Text and interpolation parameters can reference capability parameters and resolvers using the colon syntax. See {@link resolve} for defining resolvers.
     */
    title?: Translatable | false;
    /**
     * Controls the appearance of a docked part and its toggle button.
     *
     * A docked part is a part that is docked to the left, right, or bottom side of the workbench.
     *
     * This property only applies to docked parts. The perspective determines whether a part is docked or positioned relative to another part.
     */
    extras?: DockedPartExtras;
    /**
     * Defines resolvers for use in the title, label and tooltip.
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
     * Beans.get(MessageClient).onMessage('tasks/count', message => {
     *   return ...;
     * });
     * ```
     */
    resolve?: {[name: string]: string};
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * This property only applies to the microfrontend loaded into the part, not views stacked in the part.
     *
     * This property is not supported if a host microfrontend.
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

/**
 * Controls the appearance of a docked part and its toggle button.
 *
 * A docked part is a part that is docked to the left, right, or bottom side of the workbench.
 */
export interface DockedPartExtras {
  /**
   * Specifies the icon (key) displayed in the toggle button.
   *
   * Refer to the documentation of the workbench host application for available icons.
   */
  icon: string;
  /**
   * Specifies the label displayed in the toggle button.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   *
   * Text and interpolation parameters can reference capability parameters and resolvers using the colon syntax. See {@link resolve} for defining resolvers.
   */
  label: Translatable;
  /**
   * Specifies the tooltip displayed when hovering over the toggle button.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   *
   * Text and interpolation parameters can reference capability parameters and resolvers using the colon syntax. See {@link resolve} for defining resolvers.
   */
  tooltip?: Translatable;
}

/**
 * Describes a view referenced in a part.
 */
export interface WorkbenchViewRef {
  /**
   * Specifies the {@link WorkbenchViewCapability} that provides the view microfrontend.
   *
   * Declaring an intention allows for referencing public view capabilities of other applications.
   *
   * If the view capability cannot be resolved, the view is omitted, allowing conditional display, for example, based on user permissions.
   */
  qualifier: Qualifier;
  /**
   * Defines data to pass to the view.
   *
   * The view can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: {[name: string]: unknown};
  /**
   * Controls whether to activate the view. If not specified, activates the first view of the stack.
   */
  active?: boolean;
  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  cssClass?: string | string[];
}
