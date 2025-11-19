/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, Injector, NgZone, OnDestroy} from '@angular/core';
import {CapabilityInterceptor, HostManifestInterceptor, IntentInterceptor, MicrofrontendPlatform, MicrofrontendPlatformConfig, MicrofrontendPlatformHost, ObservableDecorator} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {Logger, LoggerNames} from '../../logging';
import {NgZoneObservableDecorator} from './ng-zone-observable-decorator';
import {MicrofrontendPlatformStartupPhase, runMicrofrontendPlatformInitializers} from '../microfrontend-platform-initializer';
import {MicrofrontendPlatformConfigLoader} from '../microfrontend-platform-config-loader';
import {MicrofrontendViewIntentHandler} from '../microfrontend-view/microfrontend-view-intent-handler.interceptor';
import {WorkbenchHostManifestInterceptor} from './workbench-host-manifest-interceptor.service';
import {MicrofrontendPopupIntentHandler} from '../microfrontend-popup/microfrontend-popup-intent-handler.interceptor';
import {MicrofrontendPopupCapabilityValidator} from '../microfrontend-popup/microfrontend-popup-capability-validator.interceptor';
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter, WorkbenchTextService, ɵWorkbenchDialogService, ɵWorkbenchMessageBoxService, ɵWorkbenchNotificationService, ɵWorkbenchPopupService, ɵWorkbenchRouter, ɵWorkbenchTextService} from '@scion/workbench-client';
import {MicrofrontendMessageBoxIntentHandler} from '../microfrontend-message-box/microfrontend-message-box-intent-handler.interceptor';
import {MicrofrontendDialogIntentHandler} from '../microfrontend-dialog/microfrontend-dialog-intent-handler.interceptor';
import {MicrofrontendDialogCapabilityValidator} from '../microfrontend-dialog/microfrontend-dialog-capability-validator.interceptor';
import {MicrofrontendViewCapabilityValidator} from '../microfrontend-view/microfrontend-view-capability-validator.interceptor';
import {StableCapabilityIdAssigner} from '../stable-capability-id-assigner.interceptor';
import {MicrofrontendMessageBoxCapabilityValidator} from '../microfrontend-message-box/microfrontend-message-box-capability-validator.interceptor';
import {ViewCapabilityPreloadCapabilityInterceptor} from './view-capability-preload-capability-interceptor.service';

/**
 * Initializes and starts the SCION Microfrontend Platform in host mode.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPlatformInitializer implements OnDestroy {

  private readonly _microfrontendPlatformConfigLoader = inject(MicrofrontendPlatformConfigLoader);
  private readonly _hostManifestInterceptor = inject(WorkbenchHostManifestInterceptor);
  private readonly _ngZoneObservableDecorator = inject(NgZoneObservableDecorator);
  private readonly _viewIntentHandler = inject(MicrofrontendViewIntentHandler);
  private readonly _popupIntentHandler = inject(MicrofrontendPopupIntentHandler);
  private readonly _dialogIntentHandler = inject(MicrofrontendDialogIntentHandler);
  private readonly _messageBoxIntentHandler = inject(MicrofrontendMessageBoxIntentHandler);
  private readonly _viewCapabilityValidator = inject(MicrofrontendViewCapabilityValidator);
  private readonly _popupCapabilityValidator = inject(MicrofrontendPopupCapabilityValidator);
  private readonly _dialogCapabilityValidator = inject(MicrofrontendDialogCapabilityValidator);
  private readonly _messageBoxCapabilityValidator = inject(MicrofrontendMessageBoxCapabilityValidator);
  private readonly _stableCapabilityIdAssigner = inject(StableCapabilityIdAssigner);
  private readonly _viewCapabilityPreloadCapabilityInterceptor = inject(ViewCapabilityPreloadCapabilityInterceptor);
  private readonly _injector = inject(Injector);
  private readonly _zone = inject(NgZone);
  private readonly _logger = inject(Logger);

  public config: MicrofrontendPlatformConfig | undefined;

  public async init(): Promise<void> {
    this._logger.debug('Starting SCION Microfrontend Platform...', LoggerNames.LIFECYCLE);

    // Load the microfrontend platform config.
    const microfrontendPlatformConfig: Mutable<MicrofrontendPlatformConfig> = this.config = await this._microfrontendPlatformConfigLoader.load();

    // Disable scope check to read private capabilities, e.g., required for microfrontend view routing.
    microfrontendPlatformConfig.host = {
      ...microfrontendPlatformConfig.host, // eslint-disable-line @typescript-eslint/no-misused-spread
      scopeCheckDisabled: true,
    };

    // Run initializers in `PreStartup` phase.
    await runMicrofrontendPlatformInitializers(MicrofrontendPlatformStartupPhase.PreStartup, this._injector);

    // Register beans of @scion/workbench-client.
    Beans.register(WorkbenchRouter, {useClass: ɵWorkbenchRouter});
    Beans.register(WorkbenchDialogService, {useClass: ɵWorkbenchDialogService});
    Beans.register(WorkbenchMessageBoxService, {useClass: ɵWorkbenchMessageBoxService});
    Beans.register(WorkbenchPopupService, {useClass: ɵWorkbenchPopupService});
    Beans.register(WorkbenchNotificationService, {useClass: ɵWorkbenchNotificationService});
    Beans.register(WorkbenchTextService, {useClass: ɵWorkbenchTextService});

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

    // Register message box intent interceptor to open the corresponding message box.
    Beans.register(IntentInterceptor, {useValue: this._messageBoxIntentHandler, multi: true});

    // Register view capability interceptor to assert required view capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._viewCapabilityValidator, multi: true});

    // Register popup capability interceptor to assert required popup capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._popupCapabilityValidator, multi: true});

    // Register dialog capability interceptor to assert required dialog capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._dialogCapabilityValidator, multi: true});

    // Register message box capability interceptor to assert required capability properties.
    Beans.register(CapabilityInterceptor, {useValue: this._messageBoxCapabilityValidator, multi: true});

    // Register capability interceptor to assign capabilities a stable identifier based on `STABLE_ID_CAPABILITY_TYPES` DI token.
    Beans.register(CapabilityInterceptor, {useValue: this._stableCapabilityIdAssigner, multi: true});

    // Register view capability interceptor to preload inactive microfrontend views not defining the `lazy` property to maintain compatibility with applications setting view titles and headings in view microfrontends.
    if (this.config.preloadInactiveViews) {
      Beans.register(CapabilityInterceptor, {useValue: this._viewCapabilityPreloadCapabilityInterceptor, multi: true});
    }

    // Run initializers in `PostStartup` phase; must be done in runlevel 2, i.e., before activator microfrontends are installed.
    Beans.registerInitializer({
      useFunction: () => this._zone.run(() => runMicrofrontendPlatformInitializers(MicrofrontendPlatformStartupPhase.PostStartup, this._injector)),
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
