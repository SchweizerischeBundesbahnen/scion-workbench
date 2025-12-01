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
import {HostManifestInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {MicrofrontendTextIntentionProvider} from './microfrontend-text-intention-provider.interceptor';
import {provideRemoteTextProvider} from './remote-text-provider';
import {provideHostTextProvider} from './host-text-provider';

/**
 * Provides a set of DI providers enabling microfrontend localization support.
 *
 * @see WorkbenchTextProviderCapability
 */
export function provideMicrofrontendText(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendTextIntentionProvider,
    provideRemoteTextProvider(),
    provideHostTextProvider(),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Add intention to the host manifest for the workbench to request texts from any application.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendTextIntentionProvider), multi: true});
  }
}
