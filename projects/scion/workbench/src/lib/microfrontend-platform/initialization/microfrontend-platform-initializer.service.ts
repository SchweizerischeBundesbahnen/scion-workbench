/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Injector, NgZone, OnDestroy } from '@angular/core';
import { ApplicationConfig, ApplicationManifest, IntentClient, Logger as MicrofrontendPlatformLogger, ManifestService, MessageClient, MicrofrontendPlatform, PlatformConfig, Runlevel } from '@scion/microfrontend-platform';
import { WorkbenchModuleConfig } from '../../workbench-module-config';
import { Beans } from '@scion/toolkit/bean-manager';
import { WorkbenchCapabilities } from '@scion/workbench-client';
import { Logger, LoggerNames } from '../../logging';
import { NgZoneIntentClientDecorator, NgZoneMessageClientDecorator } from './ng-zone-decorators';
import { POST_MICROFRONTEND_PLATFORM_CONNECT, runWorkbenchInitializers, WorkbenchInitializer } from '../../startup/workbench-initializer';
import { MicrofrontendPlatformConfigLoader } from '../microfrontend-platform-config-loader';
import { LogDelegate } from './log-delegate.service';

/**
 * Initializes and starts the SCION Microfrontend Platform in host mode.
 */
@Injectable()
export class MicrofrontendPlatformInitializer implements WorkbenchInitializer, OnDestroy {

  private _syntheticHostAppConfig: ApplicationConfig | null = null;

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig,
              private _microfrontendPlatformConfigLoader: MicrofrontendPlatformConfigLoader,
              private _ngZoneMessageClientDecorator: NgZoneMessageClientDecorator,
              private _ngZoneIntentClientDecorator: NgZoneIntentClientDecorator,
              private _microfrontendPlatformLogDelegate: LogDelegate,
              private _injector: Injector,
              private _zone: NgZone,
              private _logger: Logger) {
  }

  public async init(): Promise<void> {
    this._logger.debug('Starting SCION Microfrontend Platform.', LoggerNames.LIFECYCLE);

    // Load the configuration for the microfrontend platform.
    const microfrontendPlatformConfig = await this._microfrontendPlatformConfigLoader.load();

    // Create a synthetic app config for the workbench host if not passed in the app list.
    this._syntheticHostAppConfig = this.createSyntheticHostAppConfigIfAbsent(microfrontendPlatformConfig);

    // Assemble the effective microfrontend platform config.
    const effectiveHostSymbolicName = this._syntheticHostAppConfig?.symbolicName || this._workbenchModuleConfig.microfrontends!.platformHost!.symbolicName!;
    const effectiveMicrofrontendPlatformConfig: PlatformConfig = {
      ...microfrontendPlatformConfig,
      apps: microfrontendPlatformConfig.apps.concat(this._syntheticHostAppConfig || []),
    };

    // Enable the API to register intentions at runtime, required for microfrontend routing to register the wildcard `view` intention.
    this.enableIntentionRegisterApi(effectiveMicrofrontendPlatformConfig, effectiveHostSymbolicName);
    // Disable scope check to read private capabilities, required for microfrontend routing.
    this.disableScopeCheck(effectiveMicrofrontendPlatformConfig, effectiveHostSymbolicName);

    // Synchronize emissions of messaging Observables with the Angular zone.
    Beans.registerDecorator(MessageClient, {useValue: this._ngZoneMessageClientDecorator});
    Beans.registerDecorator(IntentClient, {useValue: this._ngZoneIntentClientDecorator});

    // Delegate log messages of the microfrontend platform to the workbench logger.
    Beans.register(MicrofrontendPlatformLogger, {useValue: this._microfrontendPlatformLogDelegate});

    // Register initializer to instantiate services registered under {POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
    Beans.registerInitializer({
      useFunction: () => runWorkbenchInitializers(POST_MICROFRONTEND_PLATFORM_CONNECT, this._injector),
      runlevel: Runlevel.Two, // Activator microfrontends are loaded in runlevel 3.
    });

    // Register wildcard view intention, allowing the host app to look up all view capabilities required for workbench routing to read view properties.
    Beans.registerInitializer({
      useFunction: () => this.registerWildcardIntention(WorkbenchCapabilities.View),
      runlevel: Runlevel.Two, // Activator microfrontends are loaded in runlevel 3.
    });

    // Start the microfrontend platform host.
    // It is important to start the platform outside the Angular zone as the platform subscribes to keyboard and mouse
    // events at the document level. Otherwise, excessive change detection cycles would be triggered for irrelevant events.
    await this._zone.runOutsideAngular(() => {
      return MicrofrontendPlatform.startHost(effectiveMicrofrontendPlatformConfig, {symbolicName: effectiveHostSymbolicName});
    });

    this._logger.debug('SCION Microfrontend Platform started.', LoggerNames.LIFECYCLE, effectiveMicrofrontendPlatformConfig);
  }

  /**
   * Creates an app config for the workbench host if not contained in the app list.
   *
   * Regarding the manifest URL, we create an object URL for the manifest object as passed to the workbench module config,
   * or use an empty manifest if absent.
   */
  private createSyntheticHostAppConfigIfAbsent(microfrontendPlatformConfig: PlatformConfig): ApplicationConfig | null {
    // Do nothing if the host config is present in the app list.
    const hostSymbolicName = this._workbenchModuleConfig.microfrontends!.platformHost?.symbolicName;
    if (microfrontendPlatformConfig.apps.some(app => app.symbolicName === hostSymbolicName)) {
      return null;
    }

    // Get the manifest object passed to the workbench module config, or create an empty manifest if absent.
    const hostManifest: ApplicationManifest = this._workbenchModuleConfig.microfrontends!.platformHost?.manifest || {name: 'Workbench Host'};
    return {
      symbolicName: this._workbenchModuleConfig.microfrontends!.platformHost?.symbolicName || 'workbench-host',
      manifestUrl: URL.createObjectURL(new Blob([JSON.stringify(hostManifest)], {type: 'application/json'})),
    };
  }

  private enableIntentionRegisterApi(microfrontendPlatformConfig: PlatformConfig, appSymbolicName: string): void {
    microfrontendPlatformConfig.apps.find(app => app.symbolicName === appSymbolicName)!.intentionRegisterApiDisabled = false;
  }

  private disableScopeCheck(microfrontendPlatformConfig: PlatformConfig, appSymbolicName: string): void {
    microfrontendPlatformConfig.apps.find(app => app.symbolicName === appSymbolicName)!.scopeCheckDisabled = true;
  }

  private async registerWildcardIntention(type: WorkbenchCapabilities): Promise<void> {
    await Beans.get(ManifestService).registerIntention({type, qualifier: {'*': '*'}});
  }

  public ngOnDestroy(): void {
    this._syntheticHostAppConfig && URL.revokeObjectURL(this._syntheticHostAppConfig.manifestUrl);
  }
}
