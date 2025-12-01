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
import {CapabilityInterceptor, HostManifestInterceptor, IntentInterceptor, MicrofrontendPlatformConfig} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {provideStableCapabilityId} from '../stable-capability-id-assigner.provider';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {provideViewCommandHandlers} from './microfrontend-view-command-handler.service';
import {MicrofrontendViewIntentHandler} from './microfrontend-view-intent-handler.interceptor';
import {MicrofrontendViewTransientParameterDeprecationLogger} from './microfrontend-view-transient-parameter-deprecation-logger.interceptor';
import {ViewCapabilityPreloadCapabilityInterceptor} from '../initialization/view-capability-preload-capability-interceptor.service';
import {MicrofrontendViewCapabilityValidator} from './microfrontend-view-capability-validator.interceptor';
import {provideMicrofrontendViewRoute} from './microfrontend-view-routes';
import {MicrofrontendViewIntentionProvider} from './microfrontend-view-intention-provider.interceptor';

/**
 * Provides a set of DI providers enabling microfrontend view support.
 *
 * @see WorkbenchViewCapability
 */
export function provideMicrofrontendView(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendViewIntentHandler,
    MicrofrontendViewCapabilityValidator,
    MicrofrontendViewIntentionProvider,
    ViewCapabilityPreloadCapabilityInterceptor,
    MicrofrontendViewTransientParameterDeprecationLogger,
    provideMicrofrontendViewRoute(),
    provideViewCommandHandlers(),
    provideStableCapabilityId(WorkbenchCapabilities.View),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Add view intention to the host manifest for the workbench to read view capabilities.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendViewIntentionProvider), multi: true});
    // Register view capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendViewCapabilityValidator), multi: true});
    // Register view intent handler.
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendViewIntentHandler), multi: true});
    // Register logger to inform about deprecated transient view parameters.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendViewTransientParameterDeprecationLogger), multi: true});
    // Mark views not defining the `lazy` property as 'non-lazy' to maintain compatibility with applications setting view titles in the microfrontend.
    if (inject(MicrofrontendPlatformConfig).preloadInactiveViews) {
      Beans.register(CapabilityInterceptor, {useValue: inject(ViewCapabilityPreloadCapabilityInterceptor), multi: true});
    }
  }
}
