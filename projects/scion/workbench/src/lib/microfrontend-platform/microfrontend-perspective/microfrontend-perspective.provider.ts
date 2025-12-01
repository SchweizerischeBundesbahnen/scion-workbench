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
import {MicrofrontendPerspectiveInstaller} from './microfrontend-perspective-installer.service';
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor, HostManifestInterceptor, IntentInterceptor} from '@scion/microfrontend-platform';
import {MicrofrontendPerspectiveIntentHandler} from './microfrontend-perspective-intent-handler.interceptor';
import {MicrofrontendPerspectiveCapabilityMigrator} from './microfrontend-perspective-capability-migrator.interceptor';
import {MicrofrontendPerspectiveCapabilityValidator} from './microfrontend-perspective-capability-validator.interceptor';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {provideStableCapabilityId} from '../stable-capability-id-assigner.provider';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {MicrofrontendPerspectiveIntentionProvider} from './microfrontend-perspective-intention-provider.interceptor';

/**
 * Provides a set of DI providers enabling microfrontend perspective support.
 *
 * @see WorkbenchPerspectiveCapability
 */
export function provideMicrofrontendPerspective(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendPerspectiveIntentionProvider,
    MicrofrontendPerspectiveInstaller,
    MicrofrontendPerspectiveCapabilityMigrator,
    MicrofrontendPerspectiveCapabilityValidator,
    MicrofrontendPerspectiveIntentHandler,
    provideStableCapabilityId(WorkbenchCapabilities.Perspective),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
    provideMicrofrontendPlatformInitializer(onPostStartup, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);

  function onPreStartup(): void {
    // Add perspective intention to the host manifest for the workbench to read perspective capabilities.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendPerspectiveIntentionProvider), multi: true});
    // Migrate deprecated perspective capabilities to the new perspective capability model.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPerspectiveCapabilityMigrator), multi: true});
    // Register perspective capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPerspectiveCapabilityValidator), multi: true});
    // Register perspective intent handler.
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendPerspectiveIntentHandler), multi: true});
  }

  function onPostStartup(): void {
    inject(MicrofrontendPerspectiveInstaller);
  }
}
