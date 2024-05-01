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
 * Format of a UUID (universally unique identifier) compliant with the RFC 4122 version 4.
 */
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

/**
 * Generates a UUID (universally unique identifier) compliant with the RFC 4122 version 4.
 */
export function randomUUID(): UUID {
  return UUID.randomUUID() as UUID;
}
