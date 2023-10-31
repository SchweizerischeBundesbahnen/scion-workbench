/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Injector, NgZone, OnDestroy} from '@angular/core';
import {CapabilityInterceptor, HostManifestInterceptor, IntentInterceptor, MicrofrontendPlatform, MicrofrontendPlatformConfig, MicrofrontendPlatformHost, ObservableDecorator} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {Logger, LoggerNames} from '../../logging';
import {NgZoneObservableDecorator} from './ng-zone-observable-decorator';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, MICROFRONTEND_PLATFORM_PRE_STARTUP, runWorkbenchInitializers, WorkbenchInitializer} from '../../startup/workbench-initializer';
import {MicrofrontendPlatformConfigLoader} from '../microfrontend-platform-config-loader';
import {MicrofrontendViewIntentInterceptor} from '../routing/microfrontend-view-intent-interceptor.service';
import {WorkbenchHostManifestInterceptor} from './workbench-host-manifest-interceptor.service';
import {MicrofrontendPopupIntentInterceptor} from '../microfrontend-popup/microfrontend-popup-intent-interceptor.service';
import {MicrofrontendViewCapabilityInterceptor} from '../routing/microfrontend-view-capability-interceptor.service';
import {MicrofrontendPopupCapabilityInterceptor} from '../microfrontend-popup/microfrontend-popup-capability-interceptor.service';
import {WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter} from '@scion/workbench-client';

/**
 * Initializes and starts the SCION Microfrontend Platform in host mode.
 */
@Injectable({providedIn: 'root'})
export class MicrofrontendPlatformInitializer implements WorkbenchInitializer, OnDestroy {

  public config: MicrofrontendPlatformConfig | undefined;

  constructor(private _microfrontendPlatformConfigLoader: MicrofrontendPlatformConfigLoader,
              private _hostManifestInterceptor: WorkbenchHostManifestInterceptor,
              private _ngZoneObservableDecorator: NgZoneObservableDecorator,
              private _microfrontendViewIntentInterceptor: MicrofrontendViewIntentInterceptor,
              private _microfrontendPopupIntentInterceptor: MicrofrontendPopupIntentInterceptor,
              private _microfrontendViewCapabilityInterceptor: MicrofrontendViewCapabilityInterceptor,
              private _microfrontendPopupCapabilityInterceptor: MicrofrontendPopupCapabilityInterceptor,
              private _injector: Injector,
              private _zone: NgZone,
              private _logger: Logger) {
  }

  public async init(): Promise<void> {
    this._logger.debug('Starting SCION Microfrontend Platform...', LoggerNames.LIFECYCLE);

    // Load the microfrontend platform config.
    const microfrontendPlatformConfig: Mutable<MicrofrontendPlatformConfig> = this.config = await this._microfrontendPlatformConfigLoader.load();
    if (!microfrontendPlatformConfig) {
      throw Error('[WorkbenchStartupError] Missing required Microfrontend Platform configuration. Did you forget to return the config in your loader?');
    }

    // Disable scope check to read private capabilities, e.g., required for microfrontend view routing.
    microfrontendPlatformConfig.host = {
      ...microfrontendPlatformConfig.host,
      scopeCheckDisabled: true,
    };

    // Inject services registered under {MICROFRONTEND_PLATFORM_PRE_STARTUP} DI token.
    await runWorkbenchInitializers(MICROFRONTEND_PLATFORM_PRE_STARTUP, this._injector);

    // Register beans of @scion/workbench-client.
    Beans.register(WorkbenchRouter);
    Beans.register(WorkbenchPopupService);
    Beans.register(WorkbenchMessageBoxService);
    Beans.register(WorkbenchNotificationService);

    // Register host manifest interceptor for the workbench to register workbench-specific intentions and capabilities.
    Beans.register(HostManifestInterceptor, {useValue: this._hostManifestInterceptor, multi: true});

    // Synchronize emissions of Observables exposed by the SCION Microfrontend Platform with the Angular zone.
    Beans.register(ObservableDecorator, {useValue: this._ngZoneObservableDecorator});

    // Register view intent interceptor to translate view intents into workbench router commands.
    Beans.register(IntentInterceptor, {useValue: this._microfrontendViewIntentInterceptor, multi: true});

    // Register popup intent interceptor to translate popup intents into workbench popup commands.
    Beans.register(IntentInterceptor, {useValue: this._microfrontendPopupIntentInterceptor, multi: true});

    // Register view capability interceptor to assign view capabilities a stable identifier required for persistent navigation.
    Beans.register(CapabilityInterceptor, {useValue: this._microfrontendViewCapabilityInterceptor, multi: true});

    // Register popup capability interceptor to assert required popup capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._microfrontendPopupCapabilityInterceptor, multi: true});

    // Inject services registered under {MICROFRONTEND_PLATFORM_POST_STARTUP} DI token;
    // must be done in runlevel 2, i.e., before activator microfrontends are installed.
    Beans.registerInitializer({
      useFunction: () => this._zone.run(() => runWorkbenchInitializers(MICROFRONTEND_PLATFORM_POST_STARTUP, this._injector)),
      runlevel: 2,
    });

    // Start the SCION Microfrontend Platform.
    // We start the platform outside the Angular zone in order to avoid excessive change detection cycles
    // of platform-internal subscriptions to global DOM events.
    await this._zone.runOutsideAngular(() => MicrofrontendPlatformHost.start(microfrontendPlatformConfig));

    this._logger.debug('SCION Microfrontend Platform started.', LoggerNames.LIFECYCLE, microfrontendPlatformConfig);
  }

  public ngOnDestroy(): void {
    MicrofrontendPlatform.destroy().then();
  }
}

/**
 * Make all properties in T mutable.
 */
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
