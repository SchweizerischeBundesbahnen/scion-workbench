/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Logger} from '@scion/microfrontend-platform';
import {Logger as WbLogger, LoggerNames} from '../../logging';
import {Injectable} from '@angular/core';

/**
 * Delegates log events of the SCION Microfrontend Platform to the workbench logger.
 */
@Injectable()
export class LogDelegate implements Logger {

  constructor(private _wbLogger: WbLogger) {
  }

  public info(message?: any, ...args: any[]): void {
    this._wbLogger.info(message, LoggerNames.MICROFRONTEND, ...args);
  }

  public warn(message?: any, ...args: any[]): void {
    this._wbLogger.warn(message, LoggerNames.MICROFRONTEND, ...args);
  }

  public error(message?: any, ...args: any[]): void {
    this._wbLogger.error(message, LoggerNames.MICROFRONTEND, ...args);
  }
}
