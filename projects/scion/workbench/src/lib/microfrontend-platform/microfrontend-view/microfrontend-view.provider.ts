/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders, Provider} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {CapabilityInterceptor, HostManifestInterceptor, IntentInterceptor} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchPopupService, ɵWorkbenchDialogService, ɵWorkbenchMessageBoxService, ɵWorkbenchPopupService} from '@scion/workbench-client';
import {provideStableCapabilityId} from '../stable-capability-id-assigner.provider';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {provideViewCommandHandlers} from './microfrontend-view-command-handler.service';
import {MicrofrontendViewIntentHandler} from './microfrontend-view-intent-handler.interceptor';
import {MicrofrontendViewCapabilityValidator} from './microfrontend-view-capability-validator.interceptor';
import {provideMicrofrontendViewRoute} from './microfrontend-view-routes';
import {MicrofrontendViewIntentionProvider} from './microfrontend-view-intention-provider.interceptor';
import {WORKBENCH_VIEW_CONTEXT} from '../../view/workbench-view-context.provider';
import {WorkbenchView} from '../../view/workbench-view.model';
import {provideLegacyMicrofrontendViewRoute} from './legacy-microfrontend-view-navigation-migration';

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
    provideMicrofrontendViewRoute(),
    provideLegacyMicrofrontendViewRoute(),
    provideViewCommandHandlers(),
    provideStableCapabilityId(WorkbenchCapabilities.View),
    provideWorkbenchViewContext(),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Add view intention to the host manifest for the workbench to read view capabilities.
    Beans.register(HostManifestInterceptor, {useValue: inject(MicrofrontendViewIntentionProvider), multi: true});
    // Register view capability validator.
    Beans.register(CapabilityInterceptor, {useValue: inject(MicrofrontendViewCapabilityValidator), multi: true});
    // Register view intent handler.
    Beans.register(IntentInterceptor, {useValue: inject(MicrofrontendViewIntentHandler), multi: true});
  }

  /**
   * Provides beans of @scion/workbench-client available for DI if in the context of a workbench view.
   */
  function provideWorkbenchViewContext(): Provider {
    return {
      provide: WORKBENCH_VIEW_CONTEXT,
      useFactory: (): Provider[] => [
        {provide: WorkbenchDialogService, useFactory: () => new ɵWorkbenchDialogService(inject(WorkbenchView).id)},
        {provide: WorkbenchMessageBoxService, useFactory: () => new ɵWorkbenchMessageBoxService(inject(WorkbenchView).id)},
        {provide: WorkbenchPopupService, useFactory: () => new ɵWorkbenchPopupService(inject(WorkbenchView).id)},
      ],
      multi: true,
    };
  }
}
