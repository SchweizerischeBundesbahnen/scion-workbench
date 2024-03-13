/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ParamMap} from '@angular/router';

/**
 * Replaces named parameters with values of the contained {@link Map} or {@link ParamMap}.
 */
function substitute(value: string | null | undefined, params?: Map<string, any> | ParamMap): string | undefined {
  return value?.replace(/:(\w+)/g, (match, paramName) => params?.get(paramName) ?? match);
}

/**
 * Provides helper functions for named parameters.
 */
export const NamedParameters = {substitute} as const;
