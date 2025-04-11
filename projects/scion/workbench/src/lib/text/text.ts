/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, createEnvironmentInjector, DestroyRef, EnvironmentInjector, inject, Injector, isSignal, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {Translatable, WORKBENCH_TEXT_PROVIDER, WorkbenchTextProviderFn} from './workbench-text-provider.model';

/**
 * Provides the text for the given {@link Translatable} based on the registered text provider.
 *
 * A {@link Translatable} is a string that, if starting with the percent symbol (`%`), is passed to the text provider for translation, with the percent symbol omitted.
 * Otherwise, the text is returned as is. A translation key can include parameters in matrix notation.
 *
 * Examples:
 * - `text`: no translatable text
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single param
 * - `%key;param1=value1;param2=value2`: translation key with multiple parameters
 *
 * The function:
 * - Must be called within an injection context, or an explicit {@link Injector} passed.
 * - Must be called in a non-reactive (non-tracking) context.
 */
export function text(translatable: Signal<Translatable> | Translatable, options?: {injector?: Injector}): Signal<string>;
export function text(translatable: Signal<Translatable | undefined> | Translatable | undefined, options?: {injector?: Injector}): Signal<string | undefined>;
export function text(translatable: Signal<Translatable | null> | Translatable | null, options?: {injector?: Injector}): Signal<string | null>;
export function text(translatable: Signal<Translatable | undefined | null> | Translatable | undefined | null, options?: {injector?: Injector}): Signal<string | undefined | null>;
export function text(translatable: Signal<Translatable | undefined | null> | Translatable | undefined | null, options?: {injector?: Injector}): Signal<string | undefined | null> {
  assertNotInReactiveContext(text, 'Call text() in a non-reactive (non-tracking) context, as it may allocate resources that are not released until the injection context is destroyed.');
  const injector = options?.injector ?? inject(Injector);

  // Use a separate injection context per translatable to clean up allocated resources when it changes.
  let provideTextInjector: EnvironmentInjector | undefined;
  injector.get(DestroyRef).onDestroy(() => provideTextInjector?.destroy());

  // Call the text provider function.
  const translation = computed(() => {
    const keyOrText = isSignal(translatable) ? translatable() : translatable;

    return untracked(() => {
      // Destroy previous injection context (if any) to clean up allocated resources, like RxJS subscriptions.
      provideTextInjector?.destroy();
      // Create a separate injection context.
      provideTextInjector = createEnvironmentInjector([], injector.get(EnvironmentInjector));
      // Call text provider.
      return runInInjectionContext(provideTextInjector, () => provideText(keyOrText));
    });
  });

  // Track translation in separate reactive context to not call the text provider function on translation change.
  return computed(() => translation()());
}

/**
 * Provides the text for the given {@link Translatable} based on text providers registered under the {@link WORKBENCH_TEXT_PROVIDER} DI token.
 *
 * Multiple text providers can be registered. Providers are called in registration order. If a provider does not provide the text, the next provider is called, and so on.
 */
function provideText(translatable: Translatable | undefined | null): Signal<string | undefined | null> {
  const textProviders = inject(WORKBENCH_TEXT_PROVIDER, {optional: true}) as WorkbenchTextProviderFn[] | null;
  if (!textProviders?.length || !translatable?.startsWith('%') || translatable === '%') {
    return signal(translatable);
  }

  const {key, params} = parseTranslatable(translatable as `%${string}`);
  for (const textProvider of textProviders) {
    const text = textProvider(key, params);
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
 * - %key // translation key
 * - %key;param=value // translation key with a single param
 * - %key;param1=value1;param2=value2 // translation key with multiple parameters
 */
function parseTranslatable(translationKey: `%${string}`): {key: string; params: Record<string, string>} {
  const {key, params} = /^%(?<key>[^;]+)(;(?<params>.*))?$/.exec(translationKey)!.groups!;
  return {key, params: parseMatrixParams(params)};
}

/**
 * Parses params in matrix notation.
 *
 * Format: `param1=value1;param2=value2`
 */
function parseMatrixParams(matrixParams: string | undefined): Record<string, string> {
  if (!matrixParams?.length) {
    return {};
  }

  const params: Record<string, string> = {};
  for (const match of escapeSemicolon(matrixParams).matchAll(/(?<paramName>[^=;]+)=(?<paramValue>[^;]*)/g)) {
    const {paramName, paramValue} = match.groups!;
    params[unescapeSemicolon(paramName)] = unescapeSemicolon(paramValue);
  }
  return params;

  /**
   * Replaces escaped semicolons (`\;`) with the placeholder (`ɵ`) to prevent interpretation as key-value separators.
   */
  function escapeSemicolon(value: string): string {
    return value.replaceAll('\\;', 'ɵ');
  }

  /**
   * Restores escaped semicolons by replacing the placeholder (`ɵ`) back to semicolons (`;`).
   */
  function unescapeSemicolon(value: string): string {
    return value.replaceAll('ɵ', ';');
  }
}
