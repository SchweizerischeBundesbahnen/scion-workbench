/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Handle to interact with a desktop navigated via {@link WorkbenchLayout#navigateDesktop}.
 *
 * The desktop microfrontend can inject this handle to interact with the desktop, such as signaling readiness.
 *
 * @category Desktop
 * @see WorkbenchPerspectiveCapability
 */
export abstract class WorkbenchDesktop {

  /**
   * Signals readiness, notifying the workbench that this microfrontend has completed initialization.
   *
   * If `showSplash` is set to `true` on the perspective capability, the workbench displays a splash until the microfrontend signals readiness.
   *
   * @see WorkbenchPerspectiveCapability.properties.desktop.showSplash
   */
  public abstract signalReady(): void;
}
