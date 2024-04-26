/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
import {MicrofrontendViewIntentHandler} from '../routing/microfrontend-view-intent-handler.interceptor';
import {WorkbenchHostManifestInterceptor} from './workbench-host-manifest-interceptor.service';
import {MicrofrontendPopupIntentHandler} from '../microfrontend-popup/microfrontend-popup-intent-handler.interceptor';
import {MicrofrontendPopupCapabilityValidator} from '../microfrontend-popup/microfrontend-popup-capability-validator.interceptor';
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter, ɵWorkbenchDialogService} from '@scion/workbench-client';
import {MicrofrontendDialogIntentHandler} from '../microfrontend-dialog/microfrontend-dialog-intent-handler.interceptor';
import {MicrofrontendDialogCapabilityValidator} from '../microfrontend-dialog/microfrontend-dialog-capability-validator.interceptor';
import {MicrofrontendViewCapabilityValidator} from '../routing/microfrontend-view-capability-validator.interceptor';
import {MicrofrontendViewCapabilityIdAssigner} from '../routing/microfrontend-view-capability-id-assigner.interceptor';

/**
 * Initializes and starts the SCION Microfrontend Platform in host mode.
 */
@Injectable({providedIn: 'root'})
export class MicrofrontendPlatformInitializer implements WorkbenchInitializer, OnDestroy {

  public config: MicrofrontendPlatformConfig | undefined;

  constructor(private _microfrontendPlatformConfigLoader: MicrofrontendPlatformConfigLoader,
              private _hostManifestInterceptor: WorkbenchHostManifestInterceptor,
              private _ngZoneObservableDecorator: NgZoneObservableDecorator,
              private _viewIntentHandler: MicrofrontendViewIntentHandler,
              private _popupIntentHandler: MicrofrontendPopupIntentHandler,
              private _dialogIntentHandler: MicrofrontendDialogIntentHandler,
              private _viewCapabilityValidator: MicrofrontendViewCapabilityValidator,
              private _viewCapabilityIdAssigner: MicrofrontendViewCapabilityIdAssigner,
              private _popupCapabilityValidator: MicrofrontendPopupCapabilityValidator,
              private _dialogCapabilityValidator: MicrofrontendDialogCapabilityValidator,
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
    Beans.register(WorkbenchDialogService, {useClass: ɵWorkbenchDialogService});
    Beans.register(WorkbenchNotificationService);

    // Register host manifest interceptor for the workbench to register workbench-specific intentions and capabilities.
    Beans.register(HostManifestInterceptor, {useValue: this._hostManifestInterceptor, multi: true});

    // Synchronize emissions of Observables exposed by the SCION Microfrontend Platform with the Angular zone.
    Beans.register(ObservableDecorator, {useValue: this._ngZoneObservableDecorator});

    // Register view intent interceptor to open the corresponding view.
    Beans.register(IntentInterceptor, {useValue: this._viewIntentHandler, multi: true});

    // Register popup intent interceptor to open the corresponding popup.
    Beans.register(IntentInterceptor, {useValue: this._popupIntentHandler, multi: true});

    // Register dialog intent interceptor to open the corresponding dialog.
    Beans.register(IntentInterceptor, {useValue: this._dialogIntentHandler, multi: true});

    // Register view capability interceptor to assert required view capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._viewCapabilityValidator, multi: true});

    // Register view capability interceptor to assign view capabilities a stable identifier required for persistent navigation.
    Beans.register(CapabilityInterceptor, {useValue: this._viewCapabilityIdAssigner, multi: true});

    // Register popup capability interceptor to assert required popup capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._popupCapabilityValidator, multi: true});

    // Register dialog capability interceptor to assert required dialog capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._dialogCapabilityValidator, multi: true});

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
