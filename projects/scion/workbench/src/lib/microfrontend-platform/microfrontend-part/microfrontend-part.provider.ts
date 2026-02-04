/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, Injector, makeEnvironmentProviders, Provider, runInInjectionContext} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor, HostManifestInterceptor, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchPopupService, ɵWorkbenchDialogService, ɵWorkbenchMessageBoxService, ɵWorkbenchPopupService} from '@scion/workbench-client';
import {provideStableCapabilityId} from '../stable-capability-id-assigner.provider';
import {MicrofrontendPartCapabilityValidator} from './microfrontend-part-capability-validator.interceptor';
import {provideMicrofrontendPartRoute} from './microfrontend-part-routes';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {MicrofrontendPartIntentionProvider} from './microfrontend-part-intention-provider.interceptor';
import {WORKBENCH_PART_CONTEXT} from '../../part/workbench-part-context.provider';
import {WorkbenchPart} from '../../part/workbench-part.model';
import {provideLegacyMicrofrontendPartRoute} from './legacy-microfrontend-part-navigation-migration';
import {provideWorkbenchPartInitializer} from '../../part/workbench-part-initializer';
import {provideMicrofrontendPartBadge} from './microfrontend-part-badge.provider';

/**
 * Provides a set of DI providers enabling microfrontend part support.
 *
 * @see WorkbenchPartCapability
 */
export function provideMicrofrontendPart(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendPartIntentionProvider,
    MicrofrontendPartCapabilityValidator,
    provideMicrofrontendPartRoute(),
    provideLegacyMicrofrontendPartRoute(),
    provideStableCapabilityId(WorkbenchCapabilities.Part),
    provideWorkbenchPartContext(),
    provideWorkbenchPartInitializer(async () => {
      const injector = inject(Injector);
      await MicrofrontendPlatform.whenState(PlatformState.Started);
      runInInjectionContext(injector, provideMicrofrontendPartBadge);
    }),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Add part intention to the host manifest for the workbench to read part capabilities.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendPartIntentionProvider), multi: true});
    // Register part capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendPartCapabilityValidator), multi: true});
  }

  /**
   * Provides beans of @scion/workbench-client available for DI if in the context of a workbench part.
   */
  function provideWorkbenchPartContext(): Provider {
    return {
      provide: WORKBENCH_PART_CONTEXT,
      useFactory: (): Provider[] => [
        {provide: WorkbenchDialogService, useFactory: () => new ɵWorkbenchDialogService(inject(WorkbenchPart).id)},
        {provide: WorkbenchMessageBoxService, useFactory: () => new ɵWorkbenchMessageBoxService(inject(WorkbenchPart).id)},
        {provide: WorkbenchPopupService, useFactory: () => new ɵWorkbenchPopupService(inject(WorkbenchPart).id)},
      ],
      multi: true,
    };
  }
}
