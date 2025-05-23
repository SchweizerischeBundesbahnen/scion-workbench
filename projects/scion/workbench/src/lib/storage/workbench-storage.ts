/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';

/**
 * Provides persistent storage to the SCION Workbench.
 */
export abstract class WorkbenchStorage {

  /**
   * Method invoked to load a value from persisted storage.
   */
  public abstract load(key: string): Promise<string | null> | string | null;

  /**
   * Method invoked to write a value to persisted storage.
   *
   * This method may be called during page unload. If sending data to a web server,
   * use `navigator.sendBeacon()` instead of `window.fetch()` to reliably transmit data.
   */
  public abstract store(key: string, value: string): Promise<void> | void;
}

/**
 * Default storage used by the SCION workbench to persist data in local storage.
 *
 * Local storage maintains a persistent storage area per origin. Data does not expire and remains after the browser restarts.
 *
 * @internal
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as registered conditionally under `WorkbenchStorage` DI token. */)
export class DefaultWorkbenchStorage implements WorkbenchStorage {

  public load(key: string): string | null {
    return localStorage.getItem(key);
  }

  public store(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
