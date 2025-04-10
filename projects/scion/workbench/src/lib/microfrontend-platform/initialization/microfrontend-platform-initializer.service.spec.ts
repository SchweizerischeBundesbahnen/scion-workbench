/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans} from '@scion/toolkit/bean-manager';
import {Handler, IntentInterceptor, IntentMessage} from '@scion/microfrontend-platform';
import {TestBed} from '@angular/core/testing';
import {WorkbenchLauncher} from '../../startup/workbench-launcher.service';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {MicrofrontendPerspectiveIntentHandler} from '../microfrontend-perspective/microfrontend-perspective-intent-handler.interceptor';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer.provider';

describe('Microfrontend Platform Initializer', () => {

  it('should register app-specific messaging interceptors before workbench messaging interceptors', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideRouter([]),
        provideMicrofrontendPlatformInitializer(() => void Beans.register(IntentInterceptor, {useClass: CustomIntentInterceptor, multi: true}), {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
      ],
    });

    /** Represents an app-specific intent interceptor **/
    class CustomIntentInterceptor implements IntentInterceptor {
      public intercept(intent: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
        return next.handle(intent);
      }
    }

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect app-specific interceptor to be installed first.
    expect(Beans.all(IntentInterceptor)[0]).toBeInstanceOf(CustomIntentInterceptor);
    expect(Beans.all(IntentInterceptor)[1]).toBeInstanceOf(MicrofrontendPerspectiveIntentHandler);
  });
});
