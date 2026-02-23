/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
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
 *
 * TODO [menu] Move to @scion/toolkit
 */
export type RequireOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>
}[keyof T];

/**
 * Allows maximum one property of T.
 *
 * TODO [menu] Move to @scion/toolkit
 */
export type OneOf<T> = {
  [K in keyof T]: { [P in K]: T[P] } & { [P in Exclude<keyof T, K>]?: never };
}[keyof T];

/**
 * Represents a value or a {@link Signal} of that value.
 */
export type MaybeSignal<T> = T | Signal<T>;

/**
 * Represents a value or an array of that value.
 */
export type MaybeArray<T> = T | T[];
