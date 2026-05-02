/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {map, MonoTypeOperatorFunction} from 'rxjs';
import {ACTIVATION_CONTEXT, ContextService, MessageClient} from '@scion/microfrontend-platform';
import {computed, EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {APP_SYMBOLIC_NAME, provideWorkbenchClientInitializer} from '@scion/workbench-client-angular';
import {SESSION_STORAGE} from '../session.storage';
import {take} from 'rxjs/operators';
import {MaybeSignal} from '@scion/components/common';
import {Beans} from '@scion/toolkit/bean-manager';
import {toSignal} from '@angular/core/rxjs-interop';
import {SciTextProviderFn} from '@scion/components/text';

/**
 * Provides texts from session storage.
 *
 * Storage key: `textprovider.texts.<KEY>`
 *
 * Used in `text-provider.e2e-spec.ts` to control texts of the client app.
 */
export const storageTextProvider: SciTextProviderFn = (key: string, params: {[name: string]: string}): MaybeSignal<string> | undefined => {
  const translatable = Object.entries(params).reduce((translatable, [name, value]) => `${translatable};${name}=${value}`, `%${key}`);
  const sessionStorage = inject(SESSION_STORAGE);
  const appSymbolicName = inject(APP_SYMBOLIC_NAME);
  console.debug(`[TextProvider][${appSymbolicName}] Requesting text: ${translatable}`);

  const text = toSignal(sessionStorage.observe$<string>(`textprovider.texts.${key}`, {emitIfAbsent: true}).pipe(substituteParams(params)));
  return computed(() => text() ?? translatable);
};

/**
 * Registers a message listener that replies with values from session storage.
 *
 * Request topic: `textprovider/<APP_SYMBOLIC_NAME>/values/:id`
 * Replies with the value associated with key `textprovider.values.<KEY>` from session storage.
 *
 * Used in `text-provider.e2e-spec.ts` to control resolved values in texts of the client app.
 */
export function provideValueFromStorage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideWorkbenchClientInitializer(async () => {
      const appSymbolicName = inject(APP_SYMBOLIC_NAME);
      const messageClient = inject(MessageClient);
      const sessionStorage = inject(SESSION_STORAGE);

      // Install value provider only if running in the context of an activator.
      if (!await Beans.get(ContextService).isPresent(ACTIVATION_CONTEXT)) {
        return;
      }

      // Register message listener that replies with values from session storage.
      messageClient.onMessage(`textprovider/${appSymbolicName}/values/:id`, request => {
        const id = request.params!.get('id');
        console.debug(`[TextProvider][${appSymbolicName}] Requesting value: ${id}`);
        return sessionStorage.observe$<string | undefined>(`textprovider.values.${id}`);
      });

      // Register message listener that replies with values from session storage, completing requests after responding.
      messageClient.onMessage(`textprovider/${appSymbolicName}/values/:id/complete`, request => {
        const id = request.params!.get('id');
        console.debug(`[TextProvider][${appSymbolicName}] Requesting value: ${id}`);
        return sessionStorage.observe$<string | undefined>(`textprovider.values.${id}`).pipe(take(1));
      });
    }),
  ]);
}

function substituteParams(params: {[name: string]: string}): MonoTypeOperatorFunction<string | undefined> {
  return map(text => text?.replace(/{{(?<param>[^}]+)}}/g, (match: string, param: string) => params[param] ?? match));
}
