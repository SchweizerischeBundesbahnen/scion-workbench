/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';
import {WebStorage} from '@scion/toolkit/storage';

/**
 * Provides a reference to session storage.
 */
export const SESSION_STORAGE = new InjectionToken<WebStorage>('SESSION_STORAGE', {
  providedIn: 'root',
  factory: () => new WebStorage(window.sessionStorage),
});
