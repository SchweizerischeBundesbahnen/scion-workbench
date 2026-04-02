/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {isSignal, signal, Signal} from '@angular/core';
import {MaybeSignal} from './types';

export function coerceSignal<T>(value: MaybeSignal<NonNullable<T>>): Signal<NonNullable<T>>;
export function coerceSignal<T>(value: MaybeSignal<T> | undefined): Signal<NonNullable<T>> | undefined;
export function coerceSignal<T>(value: MaybeSignal<T> | undefined, options: {defaultValue: T}): Signal<T>;
export function coerceSignal<T>(value: MaybeSignal<T> | undefined, options?: {defaultValue?: T}): Signal<T> | undefined {
  if (value === undefined) {
    return options?.defaultValue !== undefined ? signal(options.defaultValue) : undefined;
  }
  return isSignal(value) ? value : signal(value);
}
