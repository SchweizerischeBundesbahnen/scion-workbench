/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import './microfrontend-platform.config'; // DO NOT remove to augment `MicrofrontendPlatformConfig` with `splash` property.
import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders} from '@angular/core';
import {MicrofrontendPlatformInitializer} from './initialization/microfrontend-platform-initializer.service';
import {IntentClient, ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, PlatformPropertyService} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter, WorkbenchTextService} from '@scion/workbench-client';
import {NgZoneObservableDecorator} from './initialization/ng-zone-observable-decorator';
import {WorkbenchConfig} from '../workbench-config';
import {MicrofrontendPopupIntentHandler} from './microfrontend-popup/microfrontend-popup-intent-handler.interceptor';
import {WorkbenchHostManifestInterceptor} from './initialization/workbench-host-manifest-interceptor.service';
import {MicrofrontendPopupCapabilityValidator} from './microfrontend-popup/microfrontend-popup-capability-validator.interceptor';
import {provideManifestObjectCache} from './manifest-object-cache.service';
import {MicrofrontendPlatformConfigLoader} from './microfrontend-platform-config-loader';
import {provideWorkbenchInitializer} from '../startup/workbench-initializer';
import {Defined} from '@scion/toolkit/util';
import {provideRemoteTextProvider} from './text/remote-text-provider';
import {provideHostTextProvider} from './text/host-text-provider';
import {provideMicrofrontendPerspective} from './microfrontend-perspective/microfrontend-perspective.provider';
import {provideMicrofrontendPart} from './microfrontend-part/microfrontend-part.provider';
import {provideMicrofrontendView} from './microfrontend-view/microfrontend-view.provider';
import {provideMicrofrontendNotification} from './microfrontend-notification/microfrontend-notification.provider';
import {provideMicrofrontendDialog} from './microfrontend-dialog/microfrontend-dialog.provider';
import {provideMicrofrontendMessageBox} from './microfrontend-message-box/microfrontend-message-box.provider';

/**
 * Provides a set of DI providers to set up microfrontend support in the workbench.
 */
export function provideWorkbenchMicrofrontendSupport(workbenchConfig: WorkbenchConfig): EnvironmentProviders | [] {
  if (!workbenchConfig.microfrontendPlatform) {
    return [];
  }

  return makeEnvironmentProviders([
    provideMicrofrontendPlatformHost(),
    provideMicrofrontendPlatformConfig(workbenchConfig),
    provideMicrofrontendPerspective(),
    provideMicrofrontendPart(),
    provideMicrofrontendView(),
    provideMicrofrontendDialog(),
    provideMicrofrontendMessageBox(),
    provideMicrofrontendNotification(),
    provideManifestObjectCache(),
    MicrofrontendPopupIntentHandler,
    MicrofrontendPopupCapabilityValidator,
    NgZoneObservableDecorator,
    WorkbenchHostManifestInterceptor,
    provideMicrofrontendPlatformBeans(),
    provideWorkbenchClientBeans(),
    provideRemoteTextProvider(),
    provideHostTextProvider(),
  ]);
}

/**
 * Provides a set of DI providers to configure and start the SCION Microfrontend Platform in host mode.
 */
function provideMicrofrontendPlatformHost(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideWorkbenchInitializer(() => inject(MicrofrontendPlatformInitializer).init()),
    MicrofrontendPlatformInitializer,
  ]);
}

/**
 * Provides the {@link MicrofrontendPlatformConfig} for DI.
 */
function provideMicrofrontendPlatformConfig(config: WorkbenchConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MicrofrontendPlatformConfigLoader,
      useClass: typeof config.microfrontendPlatform === 'function' ? config.microfrontendPlatform : StaticMicrofrontendPlatformConfigLoader,
    },
    {
      provide: MicrofrontendPlatformConfig,
      useFactory: () => Defined.orElseThrow(inject(MicrofrontendPlatformInitializer).config, () => Error('[MicrofrontendPlatformError] Microfrontend platform configuration not found.')),
    },
  ]);
}

/**
 * Provides beans of @scion/microfrontend-platform for DI.
 */
function provideMicrofrontendPlatformBeans(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: MessageClient, useFactory: () => Beans.get(MessageClient)},
    {provide: IntentClient, useFactory: () => Beans.get(IntentClient)},
    {provide: OutletRouter, useFactory: () => Beans.get(OutletRouter)},
    {provide: ManifestService, useFactory: () => Beans.get(ManifestService)},
    {provide: PlatformPropertyService, useFactory: () => Beans.get(PlatformPropertyService)},
  ]);
}

/**
 * Provides beans of @scion/workbench-client for DI.
 */
function provideWorkbenchClientBeans(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: WorkbenchRouter, useFactory: () => Beans.get(WorkbenchRouter)},
    {provide: WorkbenchPopupService, useFactory: () => Beans.get(WorkbenchPopupService)},
    {provide: WorkbenchDialogService, useFactory: () => Beans.get(WorkbenchDialogService)},
    {provide: WorkbenchMessageBoxService, useFactory: () => Beans.get(WorkbenchMessageBoxService)},
    {provide: WorkbenchNotificationService, useFactory: () => Beans.get(WorkbenchNotificationService)},
    {provide: WorkbenchTextService, useFactory: () => Beans.get(WorkbenchTextService)},
  ]);
}

/**
 * Provides {@link WorkbenchConfig.microfrontendPlatform} config as passed to {@link provideWorkbench}.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as contributed conditionally. */)
class StaticMicrofrontendPlatformConfigLoader implements MicrofrontendPlatformConfigLoader {

  private readonly _workbenchConfig = inject(WorkbenchConfig);

  public async load(): Promise<MicrofrontendPlatformConfig> {
    return this._workbenchConfig.microfrontendPlatform! as MicrofrontendPlatformConfig;
  }
}
