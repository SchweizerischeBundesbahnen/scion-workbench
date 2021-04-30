/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { NavigationStart, ParamMap, Router, RouterEvent } from '@angular/router';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { LogAppender, LogEvent, LoggerName, LogLevel } from './logging.model';

type LogLevelStrings = keyof typeof LogLevel;

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
@Injectable()
export abstract class Logger {
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

@Injectable()
export class ɵLogger implements Logger, OnDestroy {  // tslint:disable-line:class-name

  private _destroy$ = new Subject<void>();
  private _logLevel!: LogLevel;

  constructor(@Inject(LogAppender) @Optional() private _logAppenders: LogAppender[],
              router: Router,
              logLevel: LogLevel) {
    this.observeLogLevelQueryParam$(router)
      .pipe(takeUntil(this._destroy$))
      .subscribe((queryParamLogLevel: LogLevel | undefined) => {
        this._logLevel = queryParamLogLevel ?? logLevel;
      });
  }

  public debug(message: string | (() => string), ...args: any[]): void {
    this.log(coerceLogEvent(LogLevel.DEBUG, message, args));
  }

  public info(message: string | (() => string), ...args: any[]): void {
    this.log(coerceLogEvent(LogLevel.INFO, message, args));
  }

  public warn(message: string | (() => string), ...args: any[]): void {
    this.log(coerceLogEvent(LogLevel.WARN, message, args));
  }

  public error(message: string | (() => string), ...args: any[]): void {
    this.log(coerceLogEvent(LogLevel.ERROR, message, args));
  }

  private log(event: LogEvent): void {
    if (!this._logAppenders?.length) {
      return;
    }

    if (event.level < this._logLevel) {
      return;
    }

    this._logAppenders.forEach(logAppender => logAppender.onLogMessage(event));
  }

  private observeLogLevelQueryParam$(router: Router): Observable<LogLevel | undefined> {
    return router.events
      .pipe(
        startWith(router.url),
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        map<RouterEvent, ParamMap>(routerEvent => router.parseUrl(routerEvent.url).queryParamMap),
        map(queryParamMap => queryParamMap.get('loglevel')?.toUpperCase() as LogLevelStrings | undefined),
        map(logLevelString => logLevelString ? LogLevel[logLevelString] : undefined),
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Coerces the given arguments to a {@link LogEvent}.
 */
function coerceLogEvent(level: LogLevel, message: string | (() => string), args: any[]): LogEvent {
  const messageSupplier: () => string = typeof message === 'function' ? message : (() => message);
  if (args[0] instanceof LoggerName) {
    return {level, messageSupplier, logger: args[0].toString(), args: args.slice(1)};
  }
  return {level, messageSupplier, logger: 'workbench', args};
}
