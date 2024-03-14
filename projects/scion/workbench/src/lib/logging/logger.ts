/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {LoggerName, LogLevel} from './logging.model';
import {ɵLogger} from './ɵlogger';

/**
 * Logger used by the workbench to log messages.
 *
 * Log messages are passed to registered log appenders in the form of log events for delivery to a destination.
 *
 * When configuring the workbench, you can register one or more log appenders and specify the minimum severity
 * level a message must have in order to be logged. At runtime, you can change the minimum required log level
 * by setting the `loglevel` query parameter. For example, to log messages with debug severity or higher, set
 * the query parameters as follows: `loglevel=debug`.
 *
 * By default, if not registering a log appender, the workbench registers a console log appender. The default
 * minimal required log level is set to {@link LogLevel#INFO}.
 *
 * @see {@link LogAppender}
 */
@Injectable({providedIn: 'root', useClass: ɵLogger})
export abstract class Logger {

  /**
   * Log level of the workbench logger.
   */
  public abstract readonly logLevel: LogLevel;

  /**
   * Logs a message with debug severity.
   *
   * For messages that are expensive to compose, you can provide a message supplier function.
   * The logger will call this function only if at least `DEBUG` log level is enabled.
   *
   * Optionally, you can pass the logger name as the first argument in the `args` list. The log message
   * will then be prefixed with that logger name. Logger names must be instances of {@link LoggerName}.
   */
  public abstract debug(message: string | (() => string), ...args: any[]): void;
  public abstract debug(message: string | (() => string), loggerName: LoggerName, ...args: any[]): void;

  /**
   * Logs a message with info severity.
   *
   * For messages that are expensive to compose, you can provide a message supplier function.
   * The logger will call this function only if at least `INFO` log level is enabled.
   *
   * Optionally, you can pass the logger name as the first argument in the `args` list. The log message
   * will then be prefixed with that logger name. Logger names must be instances of {@link LoggerName}.
   */
  public abstract info(message: string | (() => string), ...args: any[]): void;
  public abstract info(message: string | (() => string), loggerName: LoggerName, ...args: any[]): void;

  /**
   * Logs a message with warn severity.
   *
   * For messages that are expensive to compose, you can provide a message supplier function.
   * The logger will call this function only if at least `WARN` log level is enabled.
   *
   * Optionally, you can pass the logger name as the first argument in the `args` list. The log message
   * will then be prefixed with that logger name. Logger names must be instances of {@link LoggerName}.
   */
  public abstract warn(message: string | (() => string), ...args: any[]): void;
  public abstract warn(message: string | (() => string), loggerName: LoggerName, ...args: any[]): void;

  /**
   * Logs a message with error severity.
   *
   * For messages that are expensive to compose, you can provide a message supplier function.
   * The logger will call this function only if at least `ERROR` log level is enabled.
   *
   * Optionally, you can pass the logger name as the first argument in the `args` list. The log message
   * will then be prefixed with that logger name. Logger names must be instances of {@link LoggerName}.
   */
  public abstract error(message: string | (() => string), ...args: any[]): void;
  public abstract error(message: string | (() => string), loggerName: LoggerName, ...args: any[]): void;
}
