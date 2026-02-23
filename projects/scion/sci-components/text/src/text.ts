/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, DestroyableInjector, inject, Injector, isSignal, Signal, untracked} from '@angular/core';
import {Translatable} from './text-provider.model';
import {MaybeSignal} from '@scion/sci-components/common';
import {createDestroyableInjector} from '../../menu/src/common/injector.util';
import {TextProviders} from './text-providers';

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
      // Destroy previous injection context, if any, to clean up allocated resources, like RxJS subscriptions.
      injector?.destroy();
      // Create new injection context.
      injector = createDestroyableInjector({parent: callingContextInjector});
      // Call text providers.
      return injector.get(TextProviders).provide(keyOrText, {params: options?.params, injector});
    });
  });

  // Track translation in separate reactive context to not call the text provider function on translation change.
  return computed(() => translation()());
}
