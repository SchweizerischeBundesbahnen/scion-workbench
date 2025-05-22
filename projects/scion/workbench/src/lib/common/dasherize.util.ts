/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Converts a camelCase string to a dash-separated string.
 */
export function dasherize(value: string): string {
  return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}
