/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core/core';
import { ApplicationConfig, ApplicationConfigLoader, ErrorHandler } from './core/metadata';

/**
 * Configuration for the Workbench Application Platform.
 */
export abstract class WorkbenchApplicationPlatformConfig {

  /**
   * Registers the applications running in the platform.
   *
   * To load the application configuration from a server, use property `applicationConfigLoader` instead.
   *
   * @see applicationConfigLoader
   */
  abstract applicationConfig?: ApplicationConfig[];

  /**
   * Allows loading application configuration from a server.
   *
   * If set, the `applicationConfig` is ignored.
   *
   * @see applicationConfig
   */
  abstract applicationConfigLoader?: Type<ApplicationConfigLoader>;

  /**
   * Overwrites the default error handler which shows errors as notifications to the user.
   */
  abstract errorHandler?: Type<ErrorHandler>;
}
