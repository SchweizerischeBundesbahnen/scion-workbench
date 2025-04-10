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
import {LogAppender, LogEvent, LogLevel} from './logging.model';

/**
 * Logs messages to the console, if available.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as registered under `LogAppender` DI token. */)
export class ConsoleAppender implements LogAppender {

  public onLogMessage(event: LogEvent): void {
    switch (event.level) {
      case LogLevel.DEBUG: {
        console.debug(...[`[${event.logger}] ${event.messageSupplier()}`].concat(event.args));
        break;
      }
      case LogLevel.WARN: {
        console.warn(...[`[${event.logger}] ${event.messageSupplier()}`].concat(event.args));
        break;
      }
      case LogLevel.ERROR: {
        console.error(...[`[${event.logger}] ${event.messageSupplier()}`].concat(event.args));
        break;
      }
      default: {
        console.log(...[`[${event.logger}] ${event.messageSupplier()}`].concat(event.args));
        break;
      }
    }
  }
}
