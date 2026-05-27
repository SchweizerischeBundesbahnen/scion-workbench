/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, EnvironmentProviders, inject, Injector, makeEnvironmentProviders} from '@angular/core';
import {map, Observable} from 'rxjs';
import {provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {WorkbenchClient} from '@scion/workbench-client';
import {text} from '@scion/components/text';
import {createDestroyableInjector} from '@scion/components/common';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';

/**
 * Registers a text provider for micro apps to request texts from the host app.
 */
export function provideHostTextProvider(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => {
      const rootInjector = inject(Injector);

      WorkbenchClient.registerTextProvider((key, params) => {
        // Delegate to text provider registered in @scion/components.
        // Use a wrapper observable to bind `text()` to the lifecycle of the subscription.
        return new Observable(observer => {
          const injector = createDestroyableInjector({parent: rootInjector});

          toObservable(text(`%${key}`, {params, injector}), {injector})
            .pipe(
              map(text => text !== '' && text !== `%${key}` ? text : undefined), // emit `undefined` if not found the text
              takeUntilDestroyed(injector.get(DestroyRef)),
            )
            .subscribe(observer);

          return () => injector.destroy();
        });
      });
    }),
  ]);
}
