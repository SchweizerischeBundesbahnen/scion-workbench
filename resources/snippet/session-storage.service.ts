/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { fromEvent, merge, NEVER, Observable, of, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';

/**
 * Indicates data being loaded.
 */
const LOADING_HINT = 'LOADING_HINT [SessionStorageService]';

/**
 * Allows to interact with session storage.
 *
 * Session storage maintains a separate storage area per origin that is available for the duration of the page session
 * (as long as the browser is open, including page reloads and restores).
 */
@Injectable({providedIn: 'root'})
export class SciSessionStorageService {

  private _currentDocumentChange$ = new Subject<string>();

  /**
   * Puts data into session storage.
   */
  public put(key: string, value: any): void {
    if (value === LOADING_HINT) {
      throw Error(`[IllegalValueError] Reserved value used by \`SessionStorageService\` [value=${LOADING_HINT}]`);
    }

    sessionStorage.setItem(key, JSON.stringify(value));
    this._currentDocumentChange$.next(key);
  }

  /**
   * Returns data of given key from session storage.
   *
   * Upon subscription, it emits latest data, if any, and then continuously emits when data change. It never completes.
   *
   * Optionally, you can provide a supplier to put data into session storage if missing.
   */
  public observe$<T>(key: string, supplierIfAbsentFn$?: () => Observable<T>): Observable<T> {
    const otherDocumentChange$ = fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        filter(event => event.storageArea === sessionStorage),
        map(event => event.key),
      );

    return merge(this._currentDocumentChange$, otherDocumentChange$)
      .pipe(
        filter(itemKey => itemKey === key),
        startWith(key),
        map(itemKey => sessionStorage.getItem(itemKey)),
        filter(item => !item || item !== LOADING_HINT),
        map(item => item && JSON.parse(item)),
        switchMap((item: T | undefined): Observable<T> => {
          if (item) {
            return of(item);
          }

          if (!supplierIfAbsentFn$) {
            return NEVER;
          }

          sessionStorage.setItem(key, LOADING_HINT);
          return supplierIfAbsentFn$()
            .pipe(
              tap(it => this.put(key, it)),
              switchMap(it => of(it))
            );
        })
      );
  }
}

