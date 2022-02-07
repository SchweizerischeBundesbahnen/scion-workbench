/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Returns the error message if given an error object, or the `toString` representation otherwise.
 */
export function stringifyError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return error?.toString();
}
