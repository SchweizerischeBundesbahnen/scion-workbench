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
 */
export abstract class PlatformConfig {
  /**
   * Defines applications running in the platform.
   */
  apps: ApplicationConfig[];
  /**
   * Defines properties available in {@link PlatformProperties} bean.
   */
  properties?: {
    [key: string]: any;
  };
}

/**
 * Describes an application to register in the platform.
 */
export interface ApplicationConfig {
  /**
   * Unique symbolic name of the application.
   *
   * The symbolic name is used to create child routes to the application.
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
   * Sets whether or not capability scope check is disabled for this application.
   *
   * With scope check disabled (discouraged), the application can invoke private capabilities of other applications.
   *
   * By default, scope check is enabled.
   */
  scopeCheckDisabled?: boolean;
}
