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

    /**
     * Controls whether to preload inactive microfrontend views not defining the `lazy` property to maintain compatibility with applications setting view titles and headings in view microfrontends. Defaults to `false`.
     *
     * @deprecated since version 20.0.0-beta.6. Introduced in 20.0.0-beta.6 to maintain compatibility with applications setting view titles and headings in view microfrontends. View capabilities can now define localized titles with optional interpolation parameters using resolvers. Applications should migrate to lazy view capabilities by setting 'lazy' in capability properties and define titles in the manifest. API will be removed in version 22.
     */
    preloadInactiveViews?: true;
  }
}
