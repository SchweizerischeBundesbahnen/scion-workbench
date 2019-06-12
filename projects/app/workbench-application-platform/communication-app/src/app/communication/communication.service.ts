/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { map, mergeMapTo, take, tap } from 'rxjs/operators';
import { EMPTY, MonoTypeOperatorFunction, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { SciSessionStorageService } from '@scion/app/common';
import { Communication } from './communication.model';

const COMMUNICATIONS_STORAGE_KEY = 'communication.data';

@Injectable({providedIn: 'root'})
export class CommunicationService implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _communications$: Observable<Communication[]>;

  constructor(private _storage: SciSessionStorageService) {
    this._communications$ = this._storage.observe$(COMMUNICATIONS_STORAGE_KEY, () => of([]));
  }

  public communicationsByContactId$(contactId: string): Observable<Communication[]> {
    return this._communications$.pipe(filterByContactId(contactId));
  }

  public create$(communication: Communication): Observable<never> {
    return this._communications$
      .pipe(
        once(),
        addCommunication(this._storage, communication),
        mergeMapTo(EMPTY),
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function filterByContactId(contactId: string): OperatorFunction<Communication[], Communication[]> {
  return map((communications: Communication[]): Communication[] => {
    return communications
      .filter(communication => communication.contactId === contactId)
      .sort((c1, c2) => c1.date.localeCompare(c2.date));
  });
}

function addCommunication(storage: SciSessionStorageService, communication: Communication): MonoTypeOperatorFunction<Communication[]> {
  return tap((communications: Communication[]): void => {
    communications.push(communication);
    storage.put(COMMUNICATIONS_STORAGE_KEY, communications);
  });
}

function once<T>(): MonoTypeOperatorFunction<T> {
  return take(1);
}
