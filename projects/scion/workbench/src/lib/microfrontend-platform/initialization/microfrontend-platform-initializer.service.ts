/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Injector, NgZone} from '@angular/core';
import {CapabilityInterceptor, HostManifestInterceptor, IntentClient, IntentInterceptor, MessageClient, MicrofrontendPlatform, MicrofrontendPlatformConfig, Runlevel} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {Logger, LoggerNames} from '../../logging';
import {NgZoneIntentClientDecorator, NgZoneMessageClientDecorator} from './ng-zone-decorators';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, MICROFRONTEND_PLATFORM_PRE_STARTUP, runWorkbenchInitializers, WorkbenchInitializer} from '../../startup/workbench-initializer';
import {MicrofrontendPlatformConfigLoader} from '../microfrontend-platform-config-loader';
import {MicrofrontendViewIntentInterceptor} from '../routing/microfrontend-view-intent-interceptor.service';
import {WorkbenchHostManifestInterceptor} from './workbench-host-manifest-interceptor.service';
import {MicrofrontendPopupIntentInterceptor} from '../microfrontend-popup/microfrontend-popup-intent-interceptor.service';
import {MicrofrontendViewCapabilityInterceptor} from '../routing/microfrontend-view-capability-interceptor.service';
import {MicrofrontendPopupCapabilityInterceptor} from '../microfrontend-popup/microfrontend-popup-capability-interceptor.service';

/**
 * Initializes and starts the SCION Microfrontend Platform in host mode.
 */
@Injectable()
export class MicrofrontendPlatformInitializer implements WorkbenchInitializer {

  constructor(private _microfrontendPlatformConfigLoader: MicrofrontendPlatformConfigLoader,
              private _hostManifestInterceptor: WorkbenchHostManifestInterceptor,
              private _ngZoneMessageClientDecorator: NgZoneMessageClientDecorator,
              private _ngZoneIntentClientDecorator: NgZoneIntentClientDecorator,
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
    const microfrontendPlatformConfig: Mutable<MicrofrontendPlatformConfig> = await this._microfrontendPlatformConfigLoader.load();
    if (!microfrontendPlatformConfig) {
      throw Error('[WorkbenchStartupError] Missing required Microfrontend Platform configuration. Did you forget to return the config in your loader?');
    }

    // Disable scope check to read private capabilities, e.g., required for microfrontend view routing.
    microfrontendPlatformConfig.host = {
      ...microfrontendPlatformConfig.host,
      scopeCheckDisabled: true,
    };

    // Register hook for the workbench to register workbench-specific intentions and capabilities.
    Beans.register(HostManifestInterceptor, {useValue: this._hostManifestInterceptor, multi: true});

    // Synchronize emissions of messaging Observables with the Angular zone.
    Beans.registerDecorator(MessageClient, {useValue: this._ngZoneMessageClientDecorator});
    Beans.registerDecorator(IntentClient, {useValue: this._ngZoneIntentClientDecorator});

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
      useFunction: () => runWorkbenchInitializers(MICROFRONTEND_PLATFORM_POST_STARTUP, this._injector),
      runlevel: Runlevel.Two,
    });

    // Inject services registered under {MICROFRONTEND_PLATFORM_PRE_STARTUP} DI token.
    await runWorkbenchInitializers(MICROFRONTEND_PLATFORM_PRE_STARTUP, this._injector);

    // Start the SCION Microfrontend Platform.
    // We start the platform outside the Angular zone in order to avoid excessive change detection cycles
    // of platform-internal subscriptions to global DOM events.
    await this._zone.runOutsideAngular(() => MicrofrontendPlatform.startHost(microfrontendPlatformConfig));

    this._logger.debug('SCION Microfrontend Platform started.', LoggerNames.LIFECYCLE, microfrontendPlatformConfig);
  }
}

/**
 * Make all properties in T mutable.
 */
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
