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
 * Represents a microfrontend for display in a workbench popup.
 *
 * A popup is a visual workbench element for displaying content above other content. The popup is positioned relative
 * to an anchor based on its preferred alignment.
 *
 * The microfrontend can inject the `WorkbenchPopup` handle (and `ActivatedMicrofrontend` if a host microfrontend) to interact with the popup or access parameters.
 *
 * @category Popup
 */
export interface WorkbenchPopupCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.Popup;

  /**
   * Qualifies this popup. The qualifier is required for a popup.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the popup.
   *
   * Parameters can be:
   * - read in the microfrontend by injecting the {@link WorkbenchPopup} handle (or `ActivatedMicrofrontend` if a host microfrontend)
   * - referenced in the path using the colon syntax
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
     * Popup capabilities of the host application require an empty path. In the route, use `canMatchWorkbenchPopupCapability` guard to match the popup capability.
     *
     * @example - Route matching a popup capability with qualifier {popup: 'info'}
     * ```ts
     * import {Routes} from '@angular/router';
     * import {canMatchWorkbenchMessageBoxCapability} from '@scion/workbench';
     *
     * const routes: Routes = [
     *   {path: '', canMatch: [canMatchWorkbenchPopupCapability({popup: 'info'})], component: InfoComponent},
     * ];
     * ```
     */
    path: string;
    /**
     * Specifies the size of the popup.
     *
     * For the popup to adapt to the size of the microfrontend content, set the size to `auto` and report the microfrontend's preferred size using
     * `PreferredSizeService` in the microfrontend.
     *
     * @example - Reporting the preferred size in the microfrontend
     * ```ts
     * import {Beans} from '@scion/toolkit/bean-manager';
     * import {PreferredSizeService} from '@scion/microfrontend-platform';
     *
     * Beans.get(PreferredSizeService).fromDimension(<Microfrontend HTMLElement>);
     * ``
     *
     * If the content can grow and shrink, e.g., if using expandable panels, position the microfrontend `absolute` to allow infinite
     * space for rendering at its preferred size.
     */
    size?: WorkbenchPopupSize;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the popup microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * This property is not supported if a host microfrontend.
     *
     * @see WorkbenchPopup.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to add to the popup, e.g., to locate the popup in tests.
     */
    cssClass?: string | string[];
    /**
     * Arbitrary metadata associated with the capability.
     */
    [key: string]: unknown;
  };
}

/**
 * Specifies the popup size.
 */
export interface WorkbenchPopupSize {
  /**
   * Specifies the height of the popup, constrained by {@link minHeight} and {@link maxHeight}, if any.
   */
  height?: string | 'auto';
  /**
   * Specifies the width of the popup, constrained by {@link minWidth} and {@link maxWidth}, if any.
   */
  width?: string | 'auto';
  /**
   * Specifies the minimum height of the popup.
   */
  minHeight?: string;
  /**
   * Specifies the maximum height of the popup.
   */
  maxHeight?: string;
  /**
   * Specifies the minimum width of the popup.
   */
  minWidth?: string;
  /**
   * Specifies the maximum width of the popup.
   */
  maxWidth?: string;
}
