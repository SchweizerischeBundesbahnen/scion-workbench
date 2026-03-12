/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Signal} from '@angular/core';

/**
 * Requires at least one key from T.
 */
export type RequireOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>
}[keyof T];

export type MaybeSignal<T> = T | Signal<T>;
