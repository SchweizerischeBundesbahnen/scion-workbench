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
 * Collects messages logged to the browser console.
 */
export class ConsoleLogs {

  private _messages = new Array<ConsoleMessage>();

  constructor(private _page: Page) {
    this._page.on('console', this.onConsole);
  }

  public contains(filter?: {severity?: Severity; message?: RegExp | string}): boolean {
    return this.get(filter).length > 0;
  }

  public get(filter?: {severity?: Severity; message?: RegExp | string}): string[] {
    return this._messages
      .filter(message => filter?.severity === undefined || message.type() === filter.severity)
      .map(message => message.text())
      .filter(message => filter?.message === undefined || filterMessage(message, filter.message));
  }

  public clear(): void {
    this._messages.length = 0;
  }

  public dispose(): void {
    this._page.off('console', () => this.onConsole);
  }

  private onConsole = (message: ConsoleMessage): void => {
    this._messages.push(message);
  };
}

function filterMessage(message: string, filter: string | RegExp): boolean {
  if (typeof filter === 'string') {
    return message.includes(filter);
  }
  return message.match(filter) !== null;
}

/**
 * @see ConsoleMessage#type
 */
export type Severity = 'log' | 'debug' | 'info' | 'error' | 'warning' | 'trace';
