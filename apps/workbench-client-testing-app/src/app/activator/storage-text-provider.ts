/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchClient, WorkbenchTextProviderFn} from '@scion/workbench-client';
import {map, MonoTypeOperatorFunction} from 'rxjs';
import {MessageClient} from '@scion/microfrontend-platform';
import {inject} from '@angular/core';
import {APP_SYMBOLIC_NAME} from '../workbench-client/workbench-client.provider';
import {SESSION_STORAGE} from '../session.storage';
import {take} from 'rxjs/operators';

/**
 * Provides texts from session storage.
 *
 * Storage key: `textprovider.texts.<KEY>`
 *
 * Used in `text-provider.e2e-spec.ts` to control texts of the client app.
 */
export function provideTextFromStorage(): void {
  const sessionStorage = inject(SESSION_STORAGE);
  const appSymbolicName = inject(APP_SYMBOLIC_NAME);
  const textProviderFn: WorkbenchTextProviderFn = (key, params) => {
    const translatable = Object.entries(params).reduce((translatable, [name, value]) => `${translatable};${name}=${value}`, `%${key}`);
    console.debug(`[TextProvider][${appSymbolicName}] Requesting text: ${translatable}`);
    if (params['options.complete']) {
      return sessionStorage.observe$<string | undefined>(`textprovider.texts.${key}`)
        .pipe(
          substituteParams(params),
          take(1),
        );
    }
    else {
      return sessionStorage.observe$<string | undefined>(`textprovider.texts.${key}`).pipe(substituteParams(params));
    }
  };

  // Register text provider that reads texts from session storage.
  let textProvider = WorkbenchClient.registerTextProvider(textProviderFn);

  // Register listener to register the text provider.
  inject(MessageClient).onMessage(`textprovider/${appSymbolicName}/register`, () => {
    textProvider = WorkbenchClient.registerTextProvider(textProviderFn);
  });

  // Register listener to unregister the text provider.
  inject(MessageClient).onMessage(`textprovider/${appSymbolicName}/unregister`, () => {
    textProvider.dispose();
  });
}

/**
 * Registers a message listener that replies with values from session storage.
 *
 * Request topic: `textprovider/<APP_SYMBOLIC_NAME>/values/:id`
 * Replies with the value associated with key `textprovider.values.<KEY>` from session storage.
 *
 * Used in `text-provider.e2e-spec.ts` to control resolved values in texts of the client app.
 */
export function provideValueFromStorage(): void {
  const sessionStorage = inject(SESSION_STORAGE);
  const appSymbolicName = inject(APP_SYMBOLIC_NAME);

  // Register message listener that replies with values from session storage.
  inject(MessageClient).onMessage(`textprovider/${appSymbolicName}/values/:id`, request => {
    const id = request.params!.get('id');
    console.debug(`[TextProvider][${appSymbolicName}] Requesting value: ${id}`);
    return sessionStorage.observe$<string | undefined>(`textprovider.values.${id}`);
  });

  // Register message listener that replies with values from session storage, completing requests after responding.
  inject(MessageClient).onMessage(`textprovider/${appSymbolicName}/values/:id/complete`, request => {
    const id = request.params!.get('id');
    console.debug(`[TextProvider][${appSymbolicName}] Requesting value: ${id}`);
    return sessionStorage.observe$<string | undefined>(`textprovider.values.${id}`).pipe(take(1));
  });
}

function substituteParams(params: {[name: string]: string}): MonoTypeOperatorFunction<string | undefined> {
  return map(text => text?.replace(/{{(?<param>[^}]+)}}/g, (match: string, param: string) => params[param] ?? match));
}
