/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, inject, Injector, runInInjectionContext, Signal, untracked} from '@angular/core';
import {Translatable, WORKBENCH_TEXT_PROVIDER} from './workbench-text-provider.model';

/**
 * Provides the text for the given translatable using the text provider registered under the {@link WORKBENCH_TEXT_PROVIDER} DI token.
 *
 * Texts starting with the percent symbol (`%`) are passed to the text provider for translation, with the percent symbol omitted.
 * Otherwise, the text is returned as is.
 */
export function provideText(translatable: Signal<Translatable | undefined>, options?: {injector?: Injector}): Signal<string | undefined> {
  assertNotInReactiveContext(provideText, 'Call provideText() in a non-reactive (non-tracking) context, such as within the untracked() function.');

  const injector = options?.injector ?? inject(Injector);
  const textProvider = injector.get(WORKBENCH_TEXT_PROVIDER);

  if (!textProvider) {
    return translatable;
  }

  const translation = computed(() => {
    const keyOrText = translatable();
    if (!keyOrText?.startsWith('%')) {
      return computed(() => keyOrText);
    }
    const key = keyOrText.substring(1);
    return runInInjectionContext(injector, () => untracked(() => textProvider(key)));
  });

  // Track translation in separate reactive context to not call the text provider function on translation change.
  return computed(() => translation()());
}
