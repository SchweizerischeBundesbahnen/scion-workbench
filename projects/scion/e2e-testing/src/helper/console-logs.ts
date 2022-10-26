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
import {BehaviorSubject, debounceTime, firstValueFrom} from 'rxjs';

/**
 * Collects messages logged to the browser console.
 */
export class ConsoleLogs {

  private _messages$ = new BehaviorSubject<ConsoleMessage[]>([]);

  constructor(private _page: Page) {
    this._page.on('console', this.onConsole);
  }

  public async get(options?: {severity?: Severity; filter?: RegExp; consume?: boolean; probeInterval?: number}): Promise<string[]> {
    // Wait for log messages to become stable since received asynchronously.
    const messages = await firstValueFrom(this._messages$.pipe(debounceTime(options?.probeInterval ?? 500)));

    if (options?.consume) {
      this._messages$.next([]);
    }
    return messages
      .filter(message => options?.severity === undefined || message.type() === options.severity)
      .map(message => message.text())
      .filter(message => options?.filter === undefined || message.match(options.filter));
  }

  public async clear(): Promise<void> {
    await this.get({consume: true});
  }

  public dispose(): void {
    this._page.off('console', () => this.onConsole);
  }

  private onConsole = (message: ConsoleMessage): void => {
    this._messages$.next([...this._messages$.value, message]);
  };
}

/**
 * @see ConsoleMessage#type
 */
export type Severity = 'log' | 'debug' | 'info' | 'error' | 'warning' | 'trace';
