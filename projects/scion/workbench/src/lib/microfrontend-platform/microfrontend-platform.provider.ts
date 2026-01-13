/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, EnvironmentProviders, inject, Injectable, Injector, makeEnvironmentProviders, NgZone, Provider} from '@angular/core';
import {MicrofrontendPlatform, MicrofrontendPlatformConfig, MicrofrontendPlatformHost, ObservableDecorator} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {Logger, LoggerNames} from '../logging';
import {NgZoneObservableDecorator} from './ng-zone-observable-decorator';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer, runMicrofrontendPlatformInitializers} from './microfrontend-platform-initializer';
import {MicrofrontendPlatformConfigLoader} from './microfrontend-platform-config-loader';
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter, WorkbenchTextService, ɵWorkbenchDialogService, ɵWorkbenchMessageBoxService, ɵWorkbenchNotificationService, ɵWorkbenchPopupService, ɵWorkbenchRouter, ɵWorkbenchTextService} from '@scion/workbench-client';
import {WorkbenchConfig} from '../workbench-config';
import {provideWorkbenchInitializer} from '../startup/workbench-initializer';

/**
 * Provides a set of DI providers starting the SCION Microfrontend Platform.
 */
export function provideMicrofrontendPlatform(config: WorkbenchConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideWorkbenchInitializer(startMicrofrontendPlatform),
    provideMicrofrontendPlatformConfigLoader(config),
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
    NgZoneObservableDecorator,
  ]);

  function onPreStartup(): void {
    // Register beans of @scion/workbench-client.
    Beans.register(WorkbenchRouter, {useClass: ɵWorkbenchRouter});
    Beans.register(WorkbenchDialogService, {useClass: ɵWorkbenchDialogService});
    Beans.register(WorkbenchMessageBoxService, {useClass: ɵWorkbenchMessageBoxService});
    Beans.register(WorkbenchPopupService, {useClass: ɵWorkbenchPopupService});
    Beans.register(WorkbenchNotificationService, {useClass: ɵWorkbenchNotificationService});
    Beans.register(WorkbenchTextService, {useClass: ɵWorkbenchTextService});

    // Synchronize emissions of Observables exposed by the SCION Microfrontend Platform with the Angular zone.
    Beans.register(ObservableDecorator, {useValue: inject(NgZoneObservableDecorator)});
  }
}

/**
 * Starts the SCION Microfrontend Platform.
 */
async function startMicrofrontendPlatform(): Promise<void> {
  const zone = inject(NgZone);
  const logger = inject(Logger);
  const injector = inject(Injector);

  logger.debug('Starting SCION Microfrontend Platform...', LoggerNames.LIFECYCLE);

  // Load config of the SCION Microfrontend Platform.
  const microfrontendPlatformConfig: Mutable<MicrofrontendPlatformConfig> = await inject(MicrofrontendPlatformConfigLoader).load();

  // Disable scope check for the workbench to read private capabilities.
  microfrontendPlatformConfig.host = {
    ...microfrontendPlatformConfig.host, // eslint-disable-line @typescript-eslint/no-misused-spread
    scopeCheckDisabled: true,
  };

  // Create injector to provide the config during platform startup.
  const injectorWithConfig = Injector.create({
    parent: injector,
    providers: [{provide: MicrofrontendPlatformConfig, useValue: microfrontendPlatformConfig}],
  });

  // Run initializers in `PreStartup` phase.
  await runMicrofrontendPlatformInitializers(MicrofrontendPlatformStartupPhase.PreStartup, injectorWithConfig);

  // Run initializers in `PostStartup` phase; must be done in runlevel 2, i.e., before activator microfrontends are installed.
  Beans.registerInitializer({
    useFunction: () => zone.run(() => runMicrofrontendPlatformInitializers(MicrofrontendPlatformStartupPhase.PostStartup, injectorWithConfig)),
    runlevel: 2,
  });

  // Start the SCION Microfrontend Platform.
  // We start the platform outside the Angular zone to avoid excessive change detection cycles of platform-internal
  // subscriptions to global DOM events.
  await zone.runOutsideAngular(() => MicrofrontendPlatformHost.start(microfrontendPlatformConfig));

  // Destroy the SCION Microfrontend Platform on shutdown.
  injector.get(DestroyRef).onDestroy(() => void MicrofrontendPlatform.destroy());

  logger.debug('SCION Microfrontend Platform started.', LoggerNames.LIFECYCLE, microfrontendPlatformConfig);
}

/**
 * Provides {@link MicrofrontendPlatformConfigLoader} for injection.
 */
function provideMicrofrontendPlatformConfigLoader(config: WorkbenchConfig): Provider {
  if (typeof config.microfrontendPlatform === 'function') {
    return {
      provide: MicrofrontendPlatformConfigLoader,
      useClass: config.microfrontendPlatform,
    };
  }
  else {
    return {
      provide: MicrofrontendPlatformConfigLoader,
      useClass: StaticMicrofrontendPlatformConfigLoader,
    };
  }
}

/**
 * Make all properties in T mutable.
 */
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

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
