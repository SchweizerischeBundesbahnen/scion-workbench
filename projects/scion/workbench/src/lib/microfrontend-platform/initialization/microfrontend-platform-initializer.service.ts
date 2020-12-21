/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, InjectFlags, InjectionToken, Injector, OnDestroy } from '@angular/core';
import { ApplicationConfig } from '@scion/microfrontend-platform/lib/host/platform-config';
import { WorkbenchModuleConfig } from '../../workbench-module-config';
import { ApplicationManifest, IntentClient, Logger as MicrofrontendPlatformLogger, ManifestService, MessageClient, MicrofrontendPlatform, PlatformConfig, Runlevel } from '@scion/microfrontend-platform';
import { Beans } from '@scion/toolkit/bean-manager';
import { WorkbenchCapabilities } from '@scion/workbench-client';
import { Logger, LoggerNames } from '../../logging';
import { NgZoneIntentClientDecorator, NgZoneMessageClientDecorator } from './ng-zone-decorators';
import { WorkbenchInitializer } from '../../startup/workbench-initializer';
import { MicrofrontendPlatformConfigLoader } from '../microfrontend-platform-config-loader';
import { LogDelegate } from './log-delegate.service';

/**
 * Initializes and starts the SCION Microfrontend Platform in host mode.
 */
@Injectable()
export class MicrofrontendPlatformInitializerService implements WorkbenchInitializer, OnDestroy {

  private _hostAppConfigIfAbsent: ApplicationConfig;

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig,
              private _microfrontendPlatformConfigLoader: MicrofrontendPlatformConfigLoader,
              private _ngZoneMessageClientDecorator: NgZoneMessageClientDecorator,
              private _ngZoneIntentClientDecorator: NgZoneIntentClientDecorator,
              private _microfrontendPlatformLogDelegate: LogDelegate,
              private _injector: Injector,
              private _logger: Logger) {
  }

  public async init(): Promise<void> {
    this._logger.debug('Starting SCION Microfrontend Platform.', LoggerNames.LIFECYCLE);

    // Load the configuration for the microfrontend platform.
    const microfrontendPlatformConfig = await this._microfrontendPlatformConfigLoader.load();

    // Create a synthetic app config for the workbench host if not passed in the app list.
    this._hostAppConfigIfAbsent = this.createHostAppConfigIfAbsent(microfrontendPlatformConfig);

    // Assemble the effective microfrontend platform config.
    const effectiveHostSymbolicName = this._hostAppConfigIfAbsent?.symbolicName || this._workbenchModuleConfig.microfrontends.platformHost?.symbolicName;
    const effectiveMicrofrontendPlatformConfig: PlatformConfig = {
      ...microfrontendPlatformConfig,
      apps: microfrontendPlatformConfig.apps.concat(this._hostAppConfigIfAbsent || []),
    };

    // Enable the API to register intentions at runtime, allowing the workbench (host app) to register a wildcard `view` intention to read view capabilities during workbench microfrontend routing.
    this.enableIntentionRegisterApi(effectiveMicrofrontendPlatformConfig, effectiveHostSymbolicName);

    // Synchronize emissions of messaging Observables with the Angular zone.
    Beans.registerDecorator(MessageClient, {useValue: this._ngZoneMessageClientDecorator});
    Beans.registerDecorator(IntentClient, {useValue: this._ngZoneIntentClientDecorator});

    // Delegate log messages of the microfrontend platform to the workbench logger.
    Beans.register(MicrofrontendPlatformLogger, {useValue: this._microfrontendPlatformLogDelegate});

    // Register initializer to instantiate services registered under {MICROFRONTEND_PLATFORM_PRE_ACTIVATION} DI token.
    Beans.registerInitializer({
      useFunction: async () => {
        this._injector.get(MICROFRONTEND_PLATFORM_PRE_ACTIVATION, undefined, InjectFlags.Optional);
      },
      runlevel: Runlevel.Two, // The Microfrontend Platform install activator microfrontends in runlevel 3.
    });

    // Start the microfrontend platform host.
    await MicrofrontendPlatform.startHost(effectiveMicrofrontendPlatformConfig, {symbolicName: effectiveHostSymbolicName});

    // Register a wildcard `view` intention required for workbench microfrontend routing.
    await this.registerWildcardViewIntention();

    this._logger.debug('SCION Microfrontend Platform started.', LoggerNames.LIFECYCLE, effectiveMicrofrontendPlatformConfig);
  }

  /**
   * Creates an app config for the workbench host if not contained in the app list.
   *
   * Regarding the manifest URL, we create an object URL for the manifest object as passed to the workbench module config,
   * or use an empty manifest if absent.
   */
  private createHostAppConfigIfAbsent(microfrontendPlatformConfig: PlatformConfig): ApplicationConfig | null {
    // Do nothing if the host config is present in the app list.
    const hostSymbolicName = this._workbenchModuleConfig.microfrontends.platformHost?.symbolicName;
    if (microfrontendPlatformConfig.apps.some(app => app.symbolicName === hostSymbolicName)) {
      return null;
    }

    // Get the manifest object passed to the workbench module config, or create an empty manifest if absent.
    const hostManifest: ApplicationManifest = this._workbenchModuleConfig.microfrontends.platformHost?.manifest || {name: 'Workbench Host'};
    return {
      symbolicName: this._workbenchModuleConfig.microfrontends.platformHost?.symbolicName || 'workbench-host',
      manifestUrl: URL.createObjectURL(new Blob([JSON.stringify(hostManifest)], {type: 'application/json'})),
    };
  }

  private enableIntentionRegisterApi(microfrontendPlatformConfig: PlatformConfig, appSymbolicName: string): void {
    microfrontendPlatformConfig.apps.find(app => app.symbolicName === appSymbolicName).intentionRegisterApiDisabled = false;
  }

  private async registerWildcardViewIntention(): Promise<void> {
    await Beans.get(ManifestService).registerIntention({type: WorkbenchCapabilities.View, qualifier: {'*': '*'}});
  }

  public ngOnDestroy(): void {
    this._hostAppConfigIfAbsent && URL.revokeObjectURL(this._hostAppConfigIfAbsent.manifestUrl);
  }
}

/**
 * DI token to register services that are to be constructed before the SCION Microfrontend Platform installs activator microfrontends.
 */
export const MICROFRONTEND_PLATFORM_PRE_ACTIVATION = new InjectionToken<string>('MICROFRONTEND_PLATFORM_PRE_ACTIVATION');
