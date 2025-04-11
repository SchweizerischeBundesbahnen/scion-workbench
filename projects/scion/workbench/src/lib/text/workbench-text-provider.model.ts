/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken, Signal} from '@angular/core';

/**
 * Signature of a function to provide texts to the SCION Workbench.
 *
 * Texts starting with the percent symbol (`%`) are passed to the text provider for translation, with the percent symbol omitted.
 * Otherwise, the text is returned as is.
 *
 * A text provider can be registered via configuration passed to the {@link provideWorkbench} function.
 *
 * The function:
 * - Can call `inject` to get any required dependencies.
 * - Can call `toSignal` to convert an Observable to a Signal.
 *
 * @param key - Key for which to provide the text.
 * @param params - Parameters associated with the translation key.
 * @return The text associated with the provided key, or `undefined` if not found.
 */
export type WorkbenchTextProviderFn = (key: string, params: {[name: string]: string}) => Signal<string> | string | undefined;

/**
 * Represents either a text or a key for translation.
 *
 * A translation key starts with the percent symbol (`%`) and can include parameters in matrix notation.
 * Key and parameters are passed to {@link WorkbenchConfig.textProvider} for translation.
 *
 * Examples:
 * - `text`: no translatable text
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single param
 * - `%key;param1=value1;param2=value2`: translation key with multiple parameters
 */
export type Translatable = string | `%${string}`;

/**
 * DI token for injecting text providers to localize the SCION Workbench.
 *
 * Multiple text providers can be registered. Providers are called in registration order.
 * If a provider does not provide the text, the next provider is called, and so on.
 */
export const WORKBENCH_TEXT_PROVIDER = new InjectionToken<WorkbenchTextProviderFn>('WORKBENCH_TEXT_PROVIDER');
