/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {UUID} from '@scion/toolkit/uuid';

/**
 * Generates a UID (unique identifier).
 */
export const UID = {
  /**
   * Generates a UID (unique identifier) with length 8.
   */
  randomUID: (): string => {
    return UUID.randomUUID().substring(0, 8);
  },
};
