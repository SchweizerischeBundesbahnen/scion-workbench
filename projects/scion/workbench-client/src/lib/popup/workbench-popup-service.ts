/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchPopupConfig} from './workbench-popup.config';

/**
 * Displays a microfrontend in a popup.
 *
 * A popup is a visual workbench element for displaying content above other content. It is positioned relative to an anchor,
 * which can be an element or a coordinate. The popup moves with the anchor. By default, the popup closes on focus loss or
 * when pressing the escape key.
 *
 * A microfrontend provided as a `popup` capability can be opened in a popup. The qualifier differentiates between different
 * popup capabilities. Declaring an intention allows for opening public popup capabilities of other applications.
 *
 * A popup can be bound to a context (e.g., a part or view), displaying the popup only if the context is visible and closing
 * it when the context is disposed. Defaults to the calling context.
 *
 * @category Popup
 * @see WorkbenchPopupCapability
 */
export abstract class WorkbenchPopupService {

  /**
   * Opens the microfrontend of a `popup` capability in a workbench popup based on the given qualifier and options.
   *
   * An anchor is used to position the popup based on its preferred alignment. The anchor can be an element or a coordinate.
   *
   * By default, the popup closes on focus loss or when pressing the escape key.
   *
   * @param qualifier - Identifies the popup capability that provides the microfrontend to open in a popup.
   * @param config - Controls the appearance and behavior of the popup.
   * @returns Promise that resolves to the popup result, if any, or that rejects if the popup was closed with an error or couldn't be opened,
   *          e.g., because of missing the intention or because no `popup` capability matching the qualifier and visible to the application
   *          was found.
   */
  public abstract open<T>(qualifier: Qualifier, config: WorkbenchPopupConfig): Promise<T | undefined>;
}
