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
 * Configures the platform and defines the applications running in the platform.
 *
 * @category Platform
 */
export interface PlatformConfig {
  /**
   * Defines applications running in the platform.
   */
  apps: ApplicationConfig[];
  /**
   * Defines properties which can be read by microfrontends via {@link PlatformPropertyService}.
   */
  properties?: {
    [key: string]: any;
  };
  /**
   * Configures restricted platform functionality.
   */
  restrictions?: PlatformRestrictions;
}

/**
 * Describes how to register an application in the platform.
 *
 * @category Platform
 */
export interface ApplicationConfig {
  /**
   * Unique symbolic name of the application.
   *
   * Choose a short, lowercase name which contains alphanumeric characters and optionally dash characters.
   */
  symbolicName: string;
  /**
   * URL to the application manifest.
   */
  manifestUrl: string;
  /**
   * Excludes the application from registration, e.g. to not register it in a specific environment.
   */
  exclude?: boolean;
  /**
   * Sets whether or not this application can issue intents to private capabilities of other apps.
   *
   * By default, scope check is enabled. Disabling scope check is discouraged.
   */
  scopeCheckDisabled?: boolean;
  /**
   * Sets whether or not this application can issue intents for which it has not declared a respective intention.
   *
   * By default, intention check is enabled. Disabling intention check is discouraged.
   */
  intentionCheckDisabled?: boolean;
  /**
   * Sets whether or not the API to manage intentions is disabled for this application.
   *
   * By default, this API is disabled. With the API enabled (discouraged), the application can register and
   * unregister intentions dynamically at runtime.
   */
  intentionRegisterApiDisabled?: boolean;
}

/**
 * Configures restricted platform functionality.
 *
 * @category Platform
 */
export abstract class PlatformRestrictions {
  /**
   * Sets whether or not the API to provide application activators is disabled.
   *
   * By default, this API is enabled.
   *
   * @see {@link ActivatorProvider}
   */
  activatorApiDisabled?: boolean;
}
