/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, DestroyableInjector, inject, Injector, isSignal, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {ɵSCI_TEXT_PROVIDER, Translatable} from './text-provider.model';
import {MaybeSignal} from '@scion/sci-components/common';
import {createDestroyableInjector} from '../../menu/src/common/injector.util';
import {Maps} from '@scion/toolkit/util';
import {scionComponentsTextProvider} from './scion-components-text-provider';

/**
 * Gets the text for given {@link Translatable} from registered text providers.
 *
 * A {@link Translatable} is a string that, if starting with the percent symbol (`%`), is passed to registered text providers for translation, with the percent symbol omitted.
 * Otherwise, the text is returned as is.
 *
 * A translation key may include parameters for text interpolation. Interpolation parameters can be passed via options or appended to the translatable in matrix notation.
 * If appended, escape semicolons with two backslashes (`\\;`).
 *
 * Examples:
 * ```ts
 * // Get text for a key
 * text('%key');
 *
 * // Get text for a key and interpolation parameters
 * text('%key;param1=value1;param2=value2');
 *
 * // Or use the options object for interpolation parameters
 * text('%key', {params: {param1: 'value1', param2: 'value2'}});
 * ```
 *
 * The function:
 * - Must be called within an injection context, or an explicit {@link Injector} passed.
 * - Must be called in a non-reactive (non-tracking) context.
 *
 * @param translatable - Translation key (starts with `%`) or plain text.
 * @param options - Controls translation.
 * @param options.injector - Injector to call text providers. Defaults to the current injection context.
 *                           Note: Text providers may allocate resources that are released only when this injector is destroyed. Destroy the injector when the text is no longer needed.
 * @param options.params - Parameters for text interpolation.
 * @return Signal with the translated text.
 *
 * @see provideTextProvider
 */
export function text(translatable: MaybeSignal<Translatable>, options?: {injector?: Injector; params?: Record<string, unknown> | Map<string, unknown>}): Signal<string>;
export function text(translatable: MaybeSignal<Translatable | undefined>, options?: {injector?: Injector; params?: Record<string, unknown> | Map<string, unknown>}): Signal<string | undefined>;
export function text(translatable: MaybeSignal<Translatable | null>, options?: {injector?: Injector; params?: Record<string, unknown> | Map<string, unknown>}): Signal<string | null>;
export function text(translatable: MaybeSignal<Translatable | undefined | null>, options?: {injector?: Injector; params?: Record<string, unknown> | Map<string, unknown>}): Signal<string | undefined | null>;
export function text(translatable: MaybeSignal<Translatable | undefined | null>, options?: {injector?: Injector; params?: Record<string, unknown> | Map<string, unknown>}): Signal<string | undefined | null> {
  assertNotInReactiveContext(text, 'Call text() in a non-reactive (non-tracking) context, as it may allocate resources that are not released until the injection context is destroyed.');
  const callingContextInjector = options?.injector ?? inject(Injector);

  // Use a separate injection context per translatable to clean up allocated resources when it changes.
  let injector: DestroyableInjector | undefined;

  // Call the text provider function.
  const translation = computed(() => {
    const keyOrText = isSignal(translatable) ? translatable() : translatable;

    return untracked(() => {
      // Destroy previous injection context (if any) to clean up allocated resources, like RxJS subscriptions.
      injector?.destroy();
      // Create a separate injection context.
      injector = createDestroyableInjector({parent: callingContextInjector});
      // Call text provider.
      return runInInjectionContext(injector, () => provideText(keyOrText, {params: options?.params}));
    });
  });

  // Track translation in separate reactive context to not call the text provider function on translation change.
  return computed(() => translation()());
}

/**
 * Provides the text for the given {@link Translatable} based on text providers registered under the {@link ɵSCI_TEXT_PROVIDER} DI token.
 *
 * Multiple text providers can be registered. Providers are called in registration order. If a provider does not provide the text, the next provider is called, and so on.
 */
function provideText(translatable: Translatable | undefined | null, options: {params?: Record<string, unknown> | Map<string, unknown>}): Signal<string | undefined | null> {
  if (!translatable?.startsWith('%') || translatable === '%') {
    return signal(translatable);
  }

  // Parse translatable into key and params.
  const {key, params} = parseTranslatable(translatable as `%${string}`);

  // Append params from options.
  Maps.coerce(options.params).forEach((value, name) => params.set(name, `${value}`));

  const textProviders = [...inject(ɵSCI_TEXT_PROVIDER, {optional: true}) ?? []].concat(scionComponentsTextProvider);
  for (const textProvider of textProviders) {
    const text = textProvider(key, Object.fromEntries(params));
    if (text !== undefined) {
      return isSignal(text) ? text : signal(text);
    }
  }
  return signal(translatable);
}

/**
 * Parses a translation key into its key and parameters, if any.
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 */
function parseTranslatable(translationKey: `%${string}`): {key: string; params: Map<string, string>} {
  const {key, params} = /^%(?<key>[^;]+)(;(?<params>.*))?$/.exec(translationKey)!.groups!;
  return {key: key!, params: parseMatrixParams(params)};
}

/**
 * Parses params in matrix notation.
 *
 * Format: `param1=value1;param2=value2`
 */
function parseMatrixParams(matrixParams: string | undefined): Map<string, string> {
  if (!matrixParams?.length) {
    return new Map();
  }

  const params = new Map<string, string>();
  for (const match of encodeEscapedSemicolons(matrixParams).matchAll(/(?<paramName>[^=;]+)=(?<paramValue>[^;]*)/g)) {
    const {paramName, paramValue} = match.groups as {paramName: string; paramValue: string};
    params.set(paramName, decodeSemicolons(paramValue));
  }
  return params;

  /**
   * Encodes escaped semicolons (`\\;`) as `&#x3b` (Unicode) to prevent interpretation as interpolation parameter separators.
   */
  function encodeEscapedSemicolons(value: string): string {
    return value.replaceAll('\\;', '&#x3b');
  }

  /**
   * Decodes encoded semicolons (`&#x3b`) back to semicolons (`;`).
   */
  function decodeSemicolons(value: string): string {
    return value.replaceAll('&#x3b', ';');
  }
}
