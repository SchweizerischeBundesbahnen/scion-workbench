/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {WorkbenchLauncher} from '../../startup/workbench-launcher.service';
import {WorkbenchTestingModule} from '../../spec/workbench-testing.module';
import {Beans} from '@scion/toolkit/bean-manager';
import {Handler, IntentInterceptor, IntentMessage} from '@scion/microfrontend-platform';
import {MicrofrontendViewIntentInterceptor} from '../routing/microfrontend-view-intent-interceptor.service';
import {MicrofrontendPopupIntentInterceptor} from '../microfrontend-popup/microfrontend-popup-intent-interceptor.service';
import {MICROFRONTEND_PLATFORM_PRE_STARTUP, WorkbenchInitializer} from '../../startup/workbench-initializer';

describe('Microfrontend Platform Initializer', () => {

  it('should register app-specific messaging interceptors before workbench messaging interceptors', async () => {
    /** Represents an app-specific intent interceptor **/
    class CustomIntentInterceptor implements IntentInterceptor {
      public intercept(intent: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
        return next.handle(intent);
      }
    }

    /** Registers the app-specific intent interceptor */
    class CustomIntentInterceptorRegisterer implements WorkbenchInitializer {
      public async init(): Promise<void> {
        Beans.register(IntentInterceptor, {useClass: CustomIntentInterceptor, multi: true});
      }
    }

    // Configure testbed to start the workbench.
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forRoot({
          startup: {launcher: 'LAZY'},
          microfrontendPlatform: {applications: []},
        }),
      ],
      providers: [
        {provide: MICROFRONTEND_PLATFORM_PRE_STARTUP, multi: true, useClass: CustomIntentInterceptorRegisterer},
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect app-specific interceptor to be installed first.
    expect(Beans.all(IntentInterceptor)[0]).toBeInstanceOf(CustomIntentInterceptor);
    expect(Beans.all(IntentInterceptor)[1]).toBeInstanceOf(MicrofrontendViewIntentInterceptor);
    expect(Beans.all(IntentInterceptor)[2]).toBeInstanceOf(MicrofrontendPopupIntentInterceptor);
  });
});
