/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';
import {MaybeSignal} from '@scion/sci-components/common';

/**
 * Signature of a function to provide texts.
 *
 * Texts starting with the percent symbol (`%`) are passed to text providers for translation, with the percent symbol omitted.
 *
 * A text provider can be registered via {@link provideTextProvider} function.
 *
 * The function:
 * - Can call `inject` to get any required dependencies.
 * - Can call `toSignal` to convert an Observable to a Signal.
 *
 * @param key - Translation key of the text.
 * @param params - Parameters used for text interpolation.
 * @return Text associated with the key, or `undefined` if not found.
 *         Localized applications should return the text in the current language, and update the signal with the translated text each time when the language changes.
 */
export type SciTextProviderFn = (key: string, params: {[name: string]: string}) => MaybeSignal<string> | undefined;

/**
 * Represents either a text or a key for translation.
 *
 * A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
 *
 * Key and parameters are passed to registered text providers for translation. A text provider can be registered via
 * {@link provideTextProvider} function.
 *
 * Semicolons in interpolation parameters must be escaped with two backslashes (`\\;`).
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 * - `text`: no translation key, text is returned as is
 *
 * @see provideTextProvider
 */
export type Translatable = string | `%${string}`;

/**
 * DI token for injecting text providers.
 *
 * Multiple text providers can be registered. Providers are called in registration order.
 * If a provider does not provide the text, the next provider is called, and so on.
 */
export const ɵSCI_TEXT_PROVIDER = new InjectionToken<SciTextProviderFn[]>('SCI_TEXT_PROVIDER');
