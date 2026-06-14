/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentType} from '@angular/cdk/portal';

/**
 * Patches '@scion/microfrontend-platform' typedef definition via module augmentation.
 */
declare module '@scion/microfrontend-platform' {

  /**
   * Adds workbench-specific configuration to {@link @scion/microfrontend-platform!MicrofrontendPlatformConfig}.
   */
  export interface MicrofrontendPlatformConfig {
    /**
     * Splash to display until microfrontend signals readiness.
     *
     * A microfrontend can instruct the workbench to display a splash until signaled ready. By default, the workbench displays a loading indicator.
     *
     * @see WorkbenchViewCapability.properties.showSplash
     * @see WorkbenchPopupCapability.properties.showSplash
     */
    splash?: ComponentType<unknown>;
  }
}
