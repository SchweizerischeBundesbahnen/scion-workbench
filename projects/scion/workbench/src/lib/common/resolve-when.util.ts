/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {effect, Injector, Signal, untracked} from '@angular/core';

/**
 * Returns a Promise that resolves when signaling `true`.
 *
 * This function must be called within an injection context, or an explicit {@link Injector} passed.
 */
export function resolveWhen(condition: Signal<boolean>, options?: {injector?: Injector}): Promise<void> {
  return new Promise<void>(resolve => {
    const effectRef = effect(() => {
      if (condition()) {
        untracked(() => resolve());
        effectRef.destroy();
      }
    }, {injector: options?.injector});
  });
}
