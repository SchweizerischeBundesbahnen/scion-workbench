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
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter} from '@scion/workbench-client';
import {NgZoneObservableDecorator} from './initialization/ng-zone-observable-decorator';
import {WorkbenchConfig} from '../workbench-config';
import {provideViewCommandHandlers} from './microfrontend-view/microfrontend-view-command-handler.service';
import {provideNotificationIntentHandler} from './microfrontend-notification/microfrontend-notification-intent-handler';
import {MicrofrontendViewIntentHandler} from './microfrontend-view/microfrontend-view-intent-handler.interceptor';
import {MicrofrontendPopupIntentHandler} from './microfrontend-popup/microfrontend-popup-intent-handler.interceptor';
import {WorkbenchHostManifestInterceptor} from './initialization/workbench-host-manifest-interceptor.service';
import {CanMatchFn, Route} from '@angular/router';
import {MicrofrontendViewComponent} from './microfrontend-view/microfrontend-view.component';
import {MicrofrontendViewRoutes} from './microfrontend-view/microfrontend-view-routes';
import {MicrofrontendViewCapabilityValidator} from './microfrontend-view/microfrontend-view-capability-validator.interceptor';
import {StableCapabilityIdAssigner} from './stable-capability-id-assigner.interceptor';
import {MicrofrontendPopupCapabilityValidator} from './microfrontend-popup/microfrontend-popup-capability-validator.interceptor';
import {MicrofrontendDialogIntentHandler} from './microfrontend-dialog/microfrontend-dialog-intent-handler.interceptor';
import {MicrofrontendDialogCapabilityValidator} from './microfrontend-dialog/microfrontend-dialog-capability-validator.interceptor';
import {MicrofrontendMessageBoxIntentHandler} from './microfrontend-message-box/microfrontend-message-box-intent-handler.interceptor';
import {MicrofrontendMessageBoxCapabilityValidator} from './microfrontend-message-box/microfrontend-message-box-capability-validator.interceptor';
import {canMatchWorkbenchView} from '../routing/workbench-route-guards';
import {WORKBENCH_OUTLET} from '../routing/workbench-auxiliary-route-installer.service';
import {Routing} from '../routing/routing.util';
import {TEXT_MESSAGE_BOX_CAPABILITY_ROUTE} from './microfrontend-host-message-box/text-message/text-message.component';
import {MicrofrontendPerspectiveCapabilityValidator} from './microfrontend-perspective/microfrontend-perspective-capability-validator.interceptor';
import {providePerspectiveInstaller} from './microfrontend-perspective/microfrontend-perspective-installer.service';
import {MicrofrontendPerspectiveIntentHandler} from './microfrontend-perspective/microfrontend-perspective-intent-handler.interceptor';
import {provideManifestObjectCache} from './manifest-object-cache.service';
import {MicrofrontendPlatformConfigLoader} from './microfrontend-platform-config-loader';
import {provideWorkbenchInitializer} from '../startup/workbench-initializer';
import {Defined} from '@scion/toolkit/util';
import {WORKBENCH_ROUTE} from '../workbench.constants';

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
    provideViewCommandHandlers(),
    provideNotificationIntentHandler(),
    providePerspectiveInstaller(),
    provideManifestObjectCache(),
    MicrofrontendPerspectiveIntentHandler,
    MicrofrontendViewIntentHandler,
    MicrofrontendPopupIntentHandler,
    MicrofrontendDialogIntentHandler,
    MicrofrontendMessageBoxIntentHandler,
    MicrofrontendPerspectiveCapabilityValidator,
    MicrofrontendViewCapabilityValidator,
    MicrofrontendPopupCapabilityValidator,
    MicrofrontendDialogCapabilityValidator,
    MicrofrontendMessageBoxCapabilityValidator,
    StableCapabilityIdAssigner,
    NgZoneObservableDecorator,
    WorkbenchHostManifestInterceptor,
    provideBuiltInTextMessageBoxCapabilityRoute(),
    provideMicrofrontendViewRoute(),
    provideMicrofrontendPlatformBeans(),
    provideWorkbenchClientBeans(),
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
  ]);
}

/**
 * Provides the route for integrating microfrontend views.
 */
function provideMicrofrontendViewRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_ROUTE,
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
 * Provides the route for the built-in {@link WorkbenchMessageBoxCapability}.
 */
function provideBuiltInTextMessageBoxCapabilityRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_ROUTE,
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
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});
    return Routing.isMessageBoxOutlet(outlet);
  };
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
