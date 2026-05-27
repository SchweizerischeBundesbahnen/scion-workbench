/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, effect, inject, Injector, signal, untracked, WritableSignal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SESSION_STORAGE} from './session.storage';

/**
 * Creates a writable signal to read and write specified flag from and to session storage.
 */
export function renderingFlag<T extends string | number | boolean | null>(storageKey: string, defaultValue: T, options?: {injector?: Injector}): WritableSignal<T> {
  const injector = options?.injector ?? inject(Injector);
  const storage = inject(SESSION_STORAGE);
  const flag = signal<T>(storage.get(storageKey) ?? defaultValue);

  // Read flag from storage.
  storage.observe$(storageKey, {emitIfAbsent: false})
    .pipe(takeUntilDestroyed(injector.get(DestroyRef)))
    .subscribe(storedValue => flag.set(storedValue as T));

  // Write flag to storage.
  effect(() => {
    const value = flag();

    untracked(() => {
      if (storage.get(storageKey) === value) {
        return;
      }
      if (value === defaultValue) {
        storage.remove(storageKey);
      }
      else {
        storage.put(storageKey, value);
      }
    });
  }, {injector});

  return flag;
}
