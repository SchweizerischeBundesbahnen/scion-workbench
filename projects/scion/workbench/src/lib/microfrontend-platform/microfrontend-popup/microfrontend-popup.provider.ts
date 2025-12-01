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
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor, IntentInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {MicrofrontendPopupIntentHandler} from './microfrontend-popup-intent-handler.interceptor';
import {MicrofrontendPopupCapabilityValidator} from './microfrontend-popup-capability-validator.interceptor';

/**
 * Provides a set of DI providers enabling microfrontend popup support.
 *
 * @see WorkbenchPopupCapability
 */
export function provideMicrofrontendPopup(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendPopupIntentHandler,
    MicrofrontendPopupCapabilityValidator,
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Register popup intent handler.
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendPopupIntentHandler), multi: true});
    // Register popup capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPopupCapabilityValidator), multi: true});
  }
}
