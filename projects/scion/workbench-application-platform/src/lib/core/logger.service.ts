/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, isDevMode } from '@angular/core';

/**
 * Logs to the console if in development mode, and if the console is available.
 */
@Injectable()
export class Logger {

  /**
   * Logs with severity info.
   */
  public info(message?: any, ...args: any[]): void {
    this.log('info', message, args);
  }

  /**
   * Logs with severity warn.
   */
  public warn(message?: any, ...args: any[]): void {
    this.log('warn', message, args);
  }

  /**
   * Logs with severity error.
   */
  public error(message?: any, ...args: any[]): void {
    this.log('error', message, args);
  }

  private log(severity: 'info' | 'warn' | 'error', message: any, args: any[]): void {
    if (isDevMode() && console && console[severity]) {
      const consoleFn = console[severity];
      (args && args.length) ? consoleFn(message, ...args) : consoleFn(message);
    }
  }
}
