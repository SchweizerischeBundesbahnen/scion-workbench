/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Inject, Injectable, Optional} from '@angular/core';
import {NavigationStart, ParamMap, Router, RouterEvent} from '@angular/router';
import {filter, map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {LogAppender, LogEvent, LoggerName, LogLevel} from './logging.model';
import {Logger} from './logger';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchConfig} from '../workbench-config';

type LogLevelStrings = keyof typeof LogLevel;

@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered under `Logger` DI token. */)
export class ɵLogger implements Logger {

  public logLevel!: LogLevel;

  constructor(@Inject(LogAppender) @Optional() private _logAppenders: LogAppender[]) {
    const defaultLogLevel = inject(WorkbenchConfig, {optional: true})?.logging?.logLevel ?? LogLevel.INFO;
    this.observeLogLevelQueryParam$(inject(Router))
      .pipe(takeUntilDestroyed())
      .subscribe((queryParamLogLevel: LogLevel | undefined) => {
        this.logLevel = queryParamLogLevel ?? defaultLogLevel;
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

    if (event.level < this.logLevel) {
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
