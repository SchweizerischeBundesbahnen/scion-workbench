/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {booleanAttribute, DestroyRef, inject, Injector, numberAttribute, signal, WritableSignal} from '@angular/core';
import {WorkbenchStorage} from '../storage/workbench-storage';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {skipUntil} from 'rxjs/operators';

/**
 * Creates a writable signal to read and write specified flag from and to workbench storage.
 */
export function renderingFlag<T extends string | number | boolean | null>(storageKey: string, defaultValue: T, options?: {injector?: Injector}): WritableSignal<T> {
  const injector = options?.injector ?? inject(Injector);
  const workbenchStorage = injector.get(WorkbenchStorage);
  const flag = signal<T>(defaultValue);

  // Read flag from storage.
  const whenReadFromStorage = readFromStorage(storageKey).then(storedValue => {
    if (storedValue === null) {
      return;
    }
    switch (typeof defaultValue) {
      case 'number': {
        flag.set(numberAttribute(storedValue, defaultValue) as T);
        break;
      }
      case 'boolean': {
        flag.set(booleanAttribute(storedValue) as T);
        break;
      }
      default: {
        flag.set(storedValue as T);
      }
    }
  });

  // Write flag to storage.
  toObservable(flag, {injector})
    .pipe(
      skipUntil(whenReadFromStorage),
      takeUntilDestroyed(injector.get(DestroyRef)),
    )
    .subscribe(value => void workbenchStorage.store(storageKey, `${value}`));

  return flag;
}

async function readFromStorage(key: string): Promise<string | null> {
  return inject(WorkbenchStorage).load(key);
}
