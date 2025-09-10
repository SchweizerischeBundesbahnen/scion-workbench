/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {createEnvironmentInjector, EnvironmentInjector, EnvironmentProviders, inject, Injector, makeEnvironmentProviders} from '@angular/core';
import {map} from 'rxjs';
import {provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer.provider';
import {WorkbenchClient} from '@scion/workbench-client';
import {toObservable} from '@angular/core/rxjs-interop';
import {text} from '../../text/text';
import {finalize} from 'rxjs/operators';

/**
 * Registers a text provider for micro apps to request texts of the host app.
 */
export function provideHostTextProvider(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => {
      const injector = inject(Injector);

      WorkbenchClient.registerTextProvider((key, params) => {
        const translatable = Object.entries(params).reduce((translatable, [name, value]) => `${translatable};${name}=${encodeSemicolons(value)}`, `%${key}`);
        const environmentInjector = createEnvironmentInjector([], injector.get(EnvironmentInjector));

        return toObservable(text(translatable, {injector: environmentInjector}), {injector: environmentInjector})
          .pipe(
            map(text => text !== '' && text !== key ? text : undefined), // emit `undefined` if not found the text
            finalize(() => environmentInjector.destroy()), // free resources when the communication terminates
          );
      });
    }),
  ]);
}

/**
 * Encodes semicolons (`;`) as `\\;` to prevent interpretation as interpolation parameter separators.
 *
 * @see Translatable
 */
function encodeSemicolons(value: string): string {
  return value.replaceAll(';', '\\;');
}
