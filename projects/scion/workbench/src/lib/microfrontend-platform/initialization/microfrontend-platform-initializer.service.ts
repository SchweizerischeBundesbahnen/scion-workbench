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
import {MicrofrontendViewIntentHandler} from '../microfrontend-view/microfrontend-view-intent-handler.interceptor';
import {WorkbenchHostManifestInterceptor} from './workbench-host-manifest-interceptor.service';
import {MicrofrontendPopupIntentHandler} from '../microfrontend-popup/microfrontend-popup-intent-handler.interceptor';
import {MicrofrontendPopupCapabilityValidator} from '../microfrontend-popup/microfrontend-popup-capability-validator.interceptor';
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter, ɵWorkbenchDialogService, ɵWorkbenchMessageBoxService} from '@scion/workbench-client';
import {MicrofrontendMessageBoxIntentHandler} from '../microfrontend-message-box/microfrontend-message-box-intent-handler.interceptor';
import {MicrofrontendDialogIntentHandler} from '../microfrontend-dialog/microfrontend-dialog-intent-handler.interceptor';
import {MicrofrontendDialogCapabilityValidator} from '../microfrontend-dialog/microfrontend-dialog-capability-validator.interceptor';
import {MicrofrontendViewCapabilityValidator} from '../microfrontend-view/microfrontend-view-capability-validator.interceptor';
import {StableCapabilityIdAssigner} from '../stable-capability-id-assigner.interceptor';
import {MicrofrontendMessageBoxCapabilityValidator} from '../microfrontend-message-box/microfrontend-message-box-capability-validator.interceptor';
import {MicrofrontendMessageBoxLegacyIntentTranslator} from '../microfrontend-message-box/microfrontend-message-box-legacy-intent-translator.interceptor';
import {MicrofrontendPerspectiveCapabilityValidator} from '../microfrontend-perspective/microfrontend-perspective-capability-validator.interceptor';
import {MicrofrontendPerspectiveIntentHandler} from '../microfrontend-perspective/microfrontend-perspective-intent-handler.interceptor';

/**
 * Initializes and starts the SCION Microfrontend Platform in host mode.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPlatformInitializer implements WorkbenchInitializer, OnDestroy {

  public config: MicrofrontendPlatformConfig | undefined;

  constructor(private _microfrontendPlatformConfigLoader: MicrofrontendPlatformConfigLoader,
              private _hostManifestInterceptor: WorkbenchHostManifestInterceptor,
              private _ngZoneObservableDecorator: NgZoneObservableDecorator,
              private _perspectiveIntentHandler: MicrofrontendPerspectiveIntentHandler,
              private _viewIntentHandler: MicrofrontendViewIntentHandler,
              private _popupIntentHandler: MicrofrontendPopupIntentHandler,
              private _dialogIntentHandler: MicrofrontendDialogIntentHandler,
              private _messageBoxIntentHandler: MicrofrontendMessageBoxIntentHandler,
              private _messageBoxLegacyIntentTranslator: MicrofrontendMessageBoxLegacyIntentTranslator,
              private _viewCapabilityValidator: MicrofrontendViewCapabilityValidator,
              private _perspectiveCapabilityValidator: MicrofrontendPerspectiveCapabilityValidator,
              private _popupCapabilityValidator: MicrofrontendPopupCapabilityValidator,
              private _dialogCapabilityValidator: MicrofrontendDialogCapabilityValidator,
              private _messageBoxCapabilityValidator: MicrofrontendMessageBoxCapabilityValidator,
              private _stableCapabilityIdAssigner: StableCapabilityIdAssigner,
              private _injector: Injector,
              private _zone: NgZone,
              private _logger: Logger) {
  }

  public async init(): Promise<void> {
    this._logger.debug('Starting SCION Microfrontend Platform...', LoggerNames.LIFECYCLE);

    // Load the microfrontend platform config.
    const microfrontendPlatformConfig: Mutable<MicrofrontendPlatformConfig> = this.config = await this._microfrontendPlatformConfigLoader.load();

    // Disable scope check to read private capabilities, e.g., required for microfrontend view routing.
    microfrontendPlatformConfig.host = {
      ...microfrontendPlatformConfig.host, // eslint-disable-line @typescript-eslint/no-misused-spread
      scopeCheckDisabled: true,
    };

    // Inject services registered under {MICROFRONTEND_PLATFORM_PRE_STARTUP} DI token.
    await runWorkbenchInitializers(MICROFRONTEND_PLATFORM_PRE_STARTUP, this._injector);

    // Register beans of @scion/workbench-client.
    Beans.register(WorkbenchRouter);
    Beans.register(WorkbenchPopupService);
    Beans.register(WorkbenchMessageBoxService, {useClass: ɵWorkbenchMessageBoxService});
    Beans.register(WorkbenchDialogService, {useClass: ɵWorkbenchDialogService});
    Beans.register(WorkbenchNotificationService);

    // Register host manifest interceptor for the workbench to register workbench-specific intentions and capabilities.
    Beans.register(HostManifestInterceptor, {useValue: this._hostManifestInterceptor, multi: true});

    // Synchronize emissions of Observables exposed by the SCION Microfrontend Platform with the Angular zone.
    Beans.register(ObservableDecorator, {useValue: this._ngZoneObservableDecorator});

    // Register perspective interceptor to switch perspective.
    Beans.register(IntentInterceptor, {useValue: this._perspectiveIntentHandler, multi: true});

    // Register view intent interceptor to open the corresponding view.
    Beans.register(IntentInterceptor, {useValue: this._viewIntentHandler, multi: true});

    // Register popup intent interceptor to open the corresponding popup.
    Beans.register(IntentInterceptor, {useValue: this._popupIntentHandler, multi: true});

    // Register dialog intent interceptor to open the corresponding dialog.
    Beans.register(IntentInterceptor, {useValue: this._dialogIntentHandler, multi: true});

    // Register message box intent interceptor to provide backward compatibility for workbench clients older than version v1.0.0-beta.23.
    Beans.register(IntentInterceptor, {useValue: this._messageBoxLegacyIntentTranslator, multi: true});

    // Register message box intent interceptor to open the corresponding message box.
    Beans.register(IntentInterceptor, {useValue: this._messageBoxIntentHandler, multi: true});

    // Register perspective capability interceptor to assert required perspective capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._perspectiveCapabilityValidator, multi: true});

    // Register view capability interceptor to assert required view capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._viewCapabilityValidator, multi: true});

    // Register popup capability interceptor to assert required popup capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._popupCapabilityValidator, multi: true});

    // Register dialog capability interceptor to assert required dialog capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._dialogCapabilityValidator, multi: true});

    // Register message box capability interceptor to assert required capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._messageBoxCapabilityValidator, multi: true});

    // Register capability interceptor to assign perspective and view capabilities a stable identifier.
    Beans.register(CapabilityInterceptor, {useValue: this._stableCapabilityIdAssigner, multi: true});

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
    void MicrofrontendPlatform.destroy();
  }
}

/**
 * Make all properties in T mutable.
 */
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
