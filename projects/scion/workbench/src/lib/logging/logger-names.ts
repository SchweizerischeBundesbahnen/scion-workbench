/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {LoggerName} from './logging.model';

/**
 * Enumerates logger names used by the workbench.
 */
export const LoggerNames = {

  /**
   * Use this logger name to log messages related to workbench routing.
   */
  ROUTING: new LoggerName('workbench:router'),

  /**
   * Use this logger name to log messages related to the workbench lifecycle.
   */
  LIFECYCLE: new LoggerName('workbench:lifecycle'),

  /**
   * Use this logger name to log messages related to the microfrontend integration.
   */
  MICROFRONTEND: new LoggerName('workbench:microfrontend'),

  /**
   * Use this logger name to log messages related to the microfrontend routing.
   */
  MICROFRONTEND_ROUTING: new LoggerName('workbench:microfrontend/routing'),
} as const;
