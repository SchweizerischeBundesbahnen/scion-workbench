/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import './microfrontend-platform.config'; // DO NOT REMOVE to augment `MicrofrontendPlatformConfig` with `splash` property.
import {MicrofrontendPlatformConfigLoader} from './microfrontend-platform-config-loader';
import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders} from '@angular/core';
import {MicrofrontendPlatformInitializer} from './initialization/microfrontend-platform-initializer.service';
import {APP_IDENTITY, IntentClient, ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, PlatformPropertyService} from '@scion/microfrontend-platform';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, WORKBENCH_STARTUP} from '../startup/workbench-initializer';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter} from '@scion/workbench-client';
import {NgZoneObservableDecorator} from './initialization/ng-zone-observable-decorator';
import {WorkbenchConfig} from '../workbench-config';
import {MicrofrontendViewCommandHandler} from './microfrontend-view/microfrontend-view-command-handler.service';
import {MicrofrontendNotificationIntentHandler} from './microfrontend-notification/microfrontend-notification-intent-handler.service';
import {MicrofrontendViewIntentHandler} from './routing/microfrontend-view-intent-handler.interceptor';
import {MicrofrontendPopupIntentHandler} from './microfrontend-popup/microfrontend-popup-intent-handler.interceptor';
import {WorkbenchHostManifestInterceptor} from './initialization/workbench-host-manifest-interceptor.service';
import {CanMatchFn, Route, ROUTES} from '@angular/router';
import {MicrofrontendViewComponent} from './microfrontend-view/microfrontend-view.component';
import {MicrofrontendViewRoutes} from './routing/microfrontend-view-routes';
import {MicrofrontendViewCapabilityValidator} from './routing/microfrontend-view-capability-validator.interceptor';
import {StableCapabilityIdAssigner} from './stable-capability-id-assigner.interceptor';
import {MicrofrontendPopupCapabilityValidator} from './microfrontend-popup/microfrontend-popup-capability-validator.interceptor';
import {MicrofrontendDialogIntentHandler} from './microfrontend-dialog/microfrontend-dialog-intent-handler.interceptor';
import {MicrofrontendDialogCapabilityValidator} from './microfrontend-dialog/microfrontend-dialog-capability-validator.interceptor';
import {MicrofrontendMessageBoxIntentHandler} from './microfrontend-message-box/microfrontend-message-box-intent-handler.interceptor';
import {MicrofrontendMessageBoxCapabilityValidator} from './microfrontend-message-box/microfrontend-message-box-capability-validator.interceptor';
import {Defined} from '@scion/toolkit/util';
import {canMatchWorkbenchView} from '../view/workbench-view-route-guards';
import {WORKBENCH_AUXILIARY_ROUTE_OUTLET} from '../routing/workbench-auxiliary-route-installer.service';
import {RouterUtils} from '../routing/router.util';
import {TEXT_MESSAGE_BOX_CAPABILITY_ROUTE} from './microfrontend-host-message-box/text-message/text-message.component';
import {MicrofrontendMessageBoxLegacyIntentTranslator} from './microfrontend-message-box/microfrontend-message-box-legacy-intent-translator.interceptor';
import {MicrofrontendPerspectiveCapabilityValidator} from './microfrontend-perspective/microfrontend-perspective-capability-validator.interceptor';
import {MicrofrontendPerspectiveInstaller} from './microfrontend-perspective/microfrontend-perspective-installer.service';
import {MicrofrontendPerspectiveIntentHandler} from './microfrontend-perspective/microfrontend-perspective-intent-handler.interceptor';
import {ManifestObjectCache} from './manifest-object-cache.service';

/**
 * Provides a set of DI providers to set up microfrontend support in the workbench.
 */
export function provideWorkbenchMicrofrontendSupport(workbenchConfig: WorkbenchConfig): EnvironmentProviders | [] {
  if (!workbenchConfig.microfrontendPlatform) {
    return [];
  }

  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_STARTUP,
      useExisting: MicrofrontendPlatformInitializer,
      multi: true,
    },
    {
      provide: MicrofrontendPlatformConfigLoader,
      useClass: typeof workbenchConfig.microfrontendPlatform === 'function' ? workbenchConfig.microfrontendPlatform : StaticMicrofrontendPlatformConfigLoader,
    },
    {
      provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
      useClass: MicrofrontendViewCommandHandler,
      multi: true,
    },
    {
      provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
      useClass: MicrofrontendNotificationIntentHandler,
      multi: true,
    },
    {
      provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
      useClass: MicrofrontendPerspectiveInstaller,
      multi: true,
    },
    {
      provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
      useExisting: ManifestObjectCache,
      multi: true,
    },
    {
      provide: MicrofrontendPlatformConfig,
      useFactory: () => Defined.orElseThrow(inject(MicrofrontendPlatformInitializer).config, () => Error('[MicrofrontendPlatformError] Illegal state: Microfrontend platform configuration not loaded.')),
    },
    MicrofrontendPlatformInitializer,
    MicrofrontendPerspectiveIntentHandler,
    MicrofrontendViewIntentHandler,
    MicrofrontendPopupIntentHandler,
    MicrofrontendDialogIntentHandler,
    MicrofrontendMessageBoxLegacyIntentTranslator,
    MicrofrontendMessageBoxIntentHandler,
    MicrofrontendPerspectiveCapabilityValidator,
    MicrofrontendViewCapabilityValidator,
    MicrofrontendPopupCapabilityValidator,
    MicrofrontendDialogCapabilityValidator,
    MicrofrontendMessageBoxCapabilityValidator,
    StableCapabilityIdAssigner,
    ManifestObjectCache,
    NgZoneObservableDecorator,
    WorkbenchHostManifestInterceptor,
    provideBuiltInTextMessageBoxCapabilityRoute(),
    provideMicrofrontendViewRoute(),
    provideMicrofrontendPlatformBeans(),
    provideWorkbenchClientBeans(),
  ]);
}

/**
 * Provides {@link WorkbenchConfig.microfrontendPlatform} config as passed to {@link provideWorkbench}.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered under `MicrofrontendPlatformConfigLoader` DI token. */)
class StaticMicrofrontendPlatformConfigLoader implements MicrofrontendPlatformConfigLoader {

  constructor(private _workbenchConfig: WorkbenchConfig) {
  }

  public async load(): Promise<MicrofrontendPlatformConfig> {
    return this._workbenchConfig.microfrontendPlatform! as MicrofrontendPlatformConfig;
  }
}

/**
 * Provides beans of @scion/microfrontend-platform for DI.
 */
function provideMicrofrontendPlatformBeans(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: APP_IDENTITY, useFactory: () => Beans.get(APP_IDENTITY)},
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
  ]);
}

/**
 * Provides the route for integrating microfrontend views.
 */
function provideMicrofrontendViewRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ROUTES,
      multi: true,
      useFactory: (): Route => ({
        matcher: MicrofrontendViewRoutes.provideMicrofrontendRouteMatcher(),
        component: MicrofrontendViewComponent,
        canMatch: [canMatchWorkbenchView(true), MicrofrontendViewRoutes.canMatchViewCapability],
      }),
    },
  ]);
}

/**
 * Provides route for built-in {@link WorkbenchMessageBoxCapability}.
 */
function provideBuiltInTextMessageBoxCapabilityRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ROUTES,
      multi: true,
      useValue: {
        path: TEXT_MESSAGE_BOX_CAPABILITY_ROUTE,
        loadComponent: () => import('./microfrontend-host-message-box/text-message/text-message.component'),
        canMatch: [canMatchWorkbenchMessageBox()],
      } satisfies Route,
    },
  ]);
}

/**
 * Matches the route if target of a workbench message box.
 */
function canMatchWorkbenchMessageBox(): CanMatchFn {
  return () => {
    const outlet = inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true});
    return RouterUtils.isMessageBoxOutlet(outlet);
  };
}
