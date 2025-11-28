/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {MicrofrontendDialogIntentHandler} from './microfrontend-dialog-intent-handler.interceptor';
import {MicrofrontendDialogCapabilityValidator} from './microfrontend-dialog-capability-validator.interceptor';
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor, IntentInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';

/**
 * Provides a set of DI providers registering dialogs provided as dialog capabilities.
 */
export function provideMicrofrontendDialog(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendDialogCapabilityValidator,
    MicrofrontendDialogIntentHandler,
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Register dialog capability interceptor to assert required dialog capability properties.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendDialogCapabilityValidator), multi: true});
    // Register dialog intent interceptor to open the corresponding dialog.
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendDialogIntentHandler), multi: true});
  }
}
