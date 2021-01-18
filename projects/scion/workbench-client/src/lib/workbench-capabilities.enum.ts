/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Built-in workbench capabilities.
 */
export enum WorkbenchCapabilities {
  /**
   * Allows the contribution of a microfrontend for display in workbench view.
   */
  View = 'view',
  /**
   * Allows the contribution of a microfrontend for display in workbench popup.
   */
  Popup = 'popup',
}
