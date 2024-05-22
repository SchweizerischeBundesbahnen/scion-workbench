/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ActiveWorkbenchElementTracker {

  private _activeElement$ = new BehaviorSubject<string | null>(null);

  public setActiveElement(id: string): void {
    this._activeElement$.next(id);
  }

  public get activeElement$(): Observable<string | null> {
    return this._activeElement$;
  }

  public get activeElement(): string | null {
    return this._activeElement$.value;
  }
}
