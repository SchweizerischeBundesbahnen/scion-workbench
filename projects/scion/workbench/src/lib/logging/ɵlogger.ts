/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, inject, Injectable, Signal} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {filter, map, startWith} from 'rxjs/operators';
import {LogAppender, LogEvent, LoggerName, LogLevel} from './logging.model';
import {Logger} from './logger';
import {toSignal} from '@angular/core/rxjs-interop';
import {WorkbenchConfig} from '../workbench-config';

@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered under `Logger` DI token. */)
export class ɵLogger implements Logger {

  // TODO [Angular 20] Remove cast when Angular supports type safety for multi-injection with abstract class DI tokens.
  private readonly _logAppenders = inject(LogAppender, {optional: true}) as unknown as LogAppender[];

  private readonly _logLevel: Signal<LogLevel>;

  constructor() {
    const defaultLogLevel = inject(WorkbenchConfig, {optional: true})?.logging?.logLevel ?? LogLevel.INFO;
    const logLevel = queryParam('loglevel');
    this._logLevel = computed(() => (logLevel() ? LogLevel[logLevel()!.toUpperCase() as keyof typeof LogLevel] : defaultLogLevel) ?? defaultLogLevel);
  }

  /** @inheritDoc */
  public get logLevel(): LogLevel {
    return this._logLevel();
  }

  /** @inheritDoc */
  public debug(message: string | (() => string), ...args: any[]): void {
    this.log(coerceLogEvent(LogLevel.DEBUG, message, args));
  }

  /** @inheritDoc */
  public info(message: string | (() => string), ...args: any[]): void {
    this.log(coerceLogEvent(LogLevel.INFO, message, args));
  }

  /** @inheritDoc */
  public warn(message: string | (() => string), ...args: any[]): void {
    this.log(coerceLogEvent(LogLevel.WARN, message, args));
  }

  /** @inheritDoc */
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
}

/**
 * Reads the specified query parameter from the URL.
 */
function queryParam(queryParam: string): Signal<string | null> {
  const router = inject(Router);
  const queryParam$ = router.events
    .pipe(
      filter(event => event instanceof NavigationStart),
      map(event => event.url),
      startWith(router.url),
      map(url => router.parseUrl(url).queryParamMap.get(queryParam)),
    );
  return toSignal(queryParam$, {requireSync: true});
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
