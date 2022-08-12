/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ConsoleMessage, Page} from '@playwright/test';

/**
 * Installs a handler collecting messages logged to the browser console.
 */
export function installConsoleLogCollector(page: Page): ConsoleLogs {
  const consoleLogs = new ConsoleLogs();
  page.on('console', message => consoleLogs.add(message));
  return consoleLogs;
}

/**
 * Messages logged to the browser console.
 */
export class ConsoleLogs {
  private _messages: ConsoleMessage[] = [];

  public add(message: ConsoleMessage): void {
    this._messages.push(message);
  }

  public get(options?: {severity?: Severity; filter?: RegExp; clear?: boolean}): string[] {
    const messages = this._messages;
    if (options?.clear) {
      this._messages = [];
    }
    return messages
      .filter(message => options.severity === undefined || message.type() === options.severity)
      .map(message => message.text())
      .filter(message => options.filter === undefined || message.match(options.filter));
  }
}

/**
 * @see ConsoleMessage#type
 */
export type Severity = 'log' | 'debug' | 'info' | 'error' | 'warning' | 'trace';
