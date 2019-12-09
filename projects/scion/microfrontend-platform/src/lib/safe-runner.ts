/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Beans } from './bean-manager';
import { Logger } from './logger';

/**
 * Runs the given function. Errors are catched and logged.
 */
export function runSafe(runnable: () => void): void {
  try {
    runnable();
  }
  catch (error) {
    Beans.get(Logger).error('[UnexpectedError] An unexpected error occurred.', error);
  }
}
