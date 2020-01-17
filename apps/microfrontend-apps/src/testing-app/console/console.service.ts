/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Allows logging to the console of the testing app.
 */
@Injectable({providedIn: 'root'})
export class ConsoleService {

  private _log$ = new BehaviorSubject<Log[]>([]);

  /**
   * Logs a message to the console of the testing app.
   */
  public log(type: string, message: string): void {
    this._log$.next(this._log$.value.concat({timestamp: Date.now(), type, message}));
  }

  /**
   * Emits the console log when logging a message or clearing the console.
   */
  public get log$(): Observable<Log[]> {
    return this._log$;
  }

  /**
   * Clears the console of the testing app.
   */
  public clear(): void {
    this._log$.next([]);
  }
}

/**
 * Represents a message which was logged to the console.
 */
export interface Log {
  timestamp: number;
  type: string;
  message: string;
}
