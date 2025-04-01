/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, InjectionToken, Signal} from '@angular/core';
import {WorkbenchConfig} from '../workbench-config';

/**
 * Signature of a function to provide texts to the SCION Workbench.
 *
 * Texts starting with the percent symbol (`%`) are passed to the {@link WorkbenchConfig.textProvider} for translation,
 * with the percent symbol omitted.
 *
 * The function:
 * - Can call `inject` to get any required dependencies.
 * - Can call `toSignal` to convert an Observable to a Signal.
 */
export type WorkbenchTextProviderFn = (key: string) => Signal<string>;

/**
 * Represents either a text or a translatable key for translation.
 *
 * Translatable keys start with the percent symbol (`%`) and are passed to the {@link WorkbenchConfig.textProvider} for translation,
 * with the percent symbol omitted.
 */
export type Translatable = string | `%${string}`;

/**
 * DI token to inject {@link WorkbenchTextProviderFn} to provide texts to the SCION Workbench.
 */
export const WORKBENCH_TEXT_PROVIDER = new InjectionToken<WorkbenchTextProviderFn | undefined>('WORKBENCH_TEXT_PROVIDER', {
  providedIn: 'root',
  factory: () => inject(WorkbenchConfig, {optional: true})?.textProvider,
});
