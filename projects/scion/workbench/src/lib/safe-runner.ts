/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { Logger } from './logging';

/**
 * Runs the given function. Errors are caught and logged.
 *
 * @ignore
 */
@Injectable()
export class SafeRunner {

  constructor(private _logger: Logger) {
  }

  public run<T = void>(runnable: () => T): T {
    try {
      return runnable();
    }
    catch (error) {
      this._logger.error('Unexpected', error);
      return undefined;
    }
  }
}

