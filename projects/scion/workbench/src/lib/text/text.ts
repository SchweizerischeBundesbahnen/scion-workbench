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
 * Provides the text for the given {@link Translatable} based on registered text providers.
 *
 * A {@link Translatable} is a string that, if starting with the percent symbol (`%`), is passed to the text provider for translation, with the percent symbol omitted.
 * Otherwise, the text is returned as is. A translation key may include parameters in matrix notation for text interpolation.
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 * - `text`: no translation key, text is returned as is
 *
 * The function:
 * - Must be called within an injection context, or an explicit {@link Injector} passed.
 * - Must be called in a non-reactive (non-tracking) context.
 *
 * @experimental since 20.0.0-beta.3; API and behavior may change in any version without notice.
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
  const errorHandler = (error: unknown): string => {
    // Prefix the key with an additional `%` character to escape the leading `%` character. See console formatting rules: https://developer.mozilla.org/en-US/docs/Web/API/console
    console.error(`[TextProviderError] Failed to get text for '%${translatable}'. Caused by:`, error);
    return translatable;
  };

  for (const textProvider of textProviders) {
    // If `textProvider` throws an error, `runSafe` catches it and delegates execution to the error handler, logging the error and returning the translatable.
    const text = runSafe(() => textProvider(key, params), errorHandler);
    if (text !== undefined) {
      // If signal, wrap it in `computed` to handle errors.
      return isSignal(text) ? computed(() => runSafe(() => text(), errorHandler)) : signal(text);
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
function parseTranslatable(translationKey: `%${string}`): {key: string; params: Record<string, string>} {
  const {key, params} = /^%(?<key>[^;]+)(;(?<params>.*))?$/.exec(translationKey)!.groups!;
  return {key: key!, params: parseMatrixParams(params)};
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
  for (const match of encodeEscapedSemicolons(matrixParams).matchAll(/(?<paramName>[^=;]+)=(?<paramValue>[^;]*)/g)) {
    const {paramName, paramValue} = match.groups as {paramName: string; paramValue: string};
    params[paramName] = decodeSemicolons(paramValue);
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

/**
 * Runs the passed function.
 *
 * If the function throws an error, catches the error and delegates execution to the passed error handler, returning the handler's result.
 */
export function runSafe<T>(fn: () => T, onErrorFn: (error: unknown) => T): T {
  try {
    return fn();
  }
  catch (error) {
    return onErrorFn(error);
  }
}
