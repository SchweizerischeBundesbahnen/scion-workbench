/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders, Signal} from '@angular/core';
import {SESSION_STORAGE} from '../session.storage';
import {map} from 'rxjs/operators';
import {toSignal} from '@angular/core/rxjs-interop';
import {provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {Beans} from '@scion/toolkit/bean-manager';
import {APP_IDENTITY, MessageClient} from '@scion/microfrontend-platform';
import {MonoTypeOperatorFunction} from 'rxjs';

/**
 * Provides texts from session storage.
 *
 * Storage key: `textprovider.texts.<KEY>`
 *
 * Used in `text-provider.e2e-spec.ts` to control texts of the host app.
 */
export function provideTextFromStorage(key: string, params: {[name: string]: string}): Signal<string> | string | undefined {
  if (key.startsWith('workbench.')) {
    return undefined;
  }

  const text$ = inject(SESSION_STORAGE).observe$<string | undefined>(`textprovider.texts.${key}`)
    .pipe(
      substituteParams(params),
      map(text => text ?? ''),
    );
  return toSignal(text$, {initialValue: ''});
}

/**
 * Registers a message listener that replies with values from session storage.
 *
 * Request topic: `textprovider/workbench-host-app/values/:id`
 * Replies with the value associated with key `textprovider.values.<id>` from session storage.
 *
 * Used in `text-provider.e2e-spec.ts` to control resolved values in texts of the host app.
 */
export function provideValueFromStorage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => {
      const hostSymbolicName = Beans.get(APP_IDENTITY);
      const sessionStorage = inject(SESSION_STORAGE);
      inject(MessageClient).onMessage(`textprovider/${hostSymbolicName}/values/:id`, request => {
        return sessionStorage.observe$<string | undefined>(`textprovider.values.${request.params?.get('id')}`);
      });
    }),
  ]);
}

function substituteParams(params: {[name: string]: string}): MonoTypeOperatorFunction<string | undefined> {
  return map(text => text?.replace(/{{(?<param>[^}]+)}}/g, (match: string, param: string) => params[param] ?? match));
}
