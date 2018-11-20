/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { InjectionToken } from '@angular/core';

/**
 * DI injection token to ensure `WorkbenchApplicationPlatformModule.forRoot()` is not used in a lazy context.
 */
export const FORROOT_GUARD = new InjectionToken<void>('WORKBENCH_APPLICATION_PLATFORM_FORROOT_GUARD');
