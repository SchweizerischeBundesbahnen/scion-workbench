/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Dictionaries} from '@scion/toolkit/util';

/**
 * Provides helper functions for working with objects.
 */
export const Objects = {

  /**
   * Like {@link Dictionaries.withoutUndefinedEntries}, but preserving the object data type.
   */
  withoutUndefinedEntries: <T>(object: T & Record<string, unknown>): T => {
    return Dictionaries.withoutUndefinedEntries(object) as T;
  },

} as const;
