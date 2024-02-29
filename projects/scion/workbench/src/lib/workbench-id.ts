/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';

/**
 * DI token to get a unique id of the workbench.
 *
 * The id is different each time the app is reloaded. Different workbench windows have different ids.
 */
export const WORKBENCH_ID = new InjectionToken<string>('WORKBENCH_ID', {
  providedIn: 'root',
  factory: () => UUID.randomUUID(),
});
