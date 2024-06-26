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
import {MICROFRONTEND_PLATFORM_PRE_STARTUP, WorkbenchInitializer} from '../../startup/workbench-initializer';
import {TestBed} from '@angular/core/testing';
import {WorkbenchLauncher} from '../../startup/workbench-launcher.service';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {MicrofrontendPerspectiveIntentHandler} from '../microfrontend-perspective/microfrontend-perspective-intent-handler.interceptor';

describe('Microfrontend Platform Initializer', () => {

  it('should register app-specific messaging interceptors before workbench messaging interceptors', async () => {
    /** Represents an app-specific intent interceptor **/
    class CustomIntentInterceptor implements IntentInterceptor {
      public intercept(intent: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
        return next.handle(intent);
      }
    }

    /** Registers the app-specific intent interceptor */
    class IntentInterceptorInstaller implements WorkbenchInitializer {
      public async init(): Promise<void> {
        Beans.register(IntentInterceptor, {useClass: CustomIntentInterceptor, multi: true});
      }
    }

    // Configure and start the SCION Workbench.
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideRouter([]),
        {provide: MICROFRONTEND_PLATFORM_PRE_STARTUP, multi: true, useClass: IntentInterceptorInstaller},
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect app-specific interceptor to be installed first.
    expect(Beans.all(IntentInterceptor)[0]).toBeInstanceOf(CustomIntentInterceptor);
    expect(Beans.all(IntentInterceptor)[1]).toBeInstanceOf(MicrofrontendPerspectiveIntentHandler);
  });
});
