/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageClient } from './client/message-client';
import { ManifestRegistry } from './host/manifest.registry';
import { ApplicationRegistry } from './host/application.registry';
import { BeanInstanceConstructInstructions, Beans, InstanceConstructInstructions, Type } from './bean-manager';
import { ɵMessageClient } from './client/ɵmessage-client';
import { PlatformState, PlatformStates } from './platform-state';
import { PlatformConfigLoader } from './host/platform-config-loader';
import { from, Observable, of } from 'rxjs';
import { ClientConfig } from './client/client-config';
import { ApplicationConfig, PlatformConfig } from './host/platform-config';
import { PlatformProperties } from './host/platform-properties';
import { Logger } from './logger';
import { HttpClient } from './host/http-client';
import { ManifestCollector } from './host/manifest-collector';
import { PlatformMessageClient } from './host/platform-message-client';
import { PLATFORM_SYMBOLIC_NAME } from './host/platform.constants';
import { PlatformInitializer } from './host/platform-initializer';
import { Defined } from '@scion/toolkit/util';
import { HostPlatformState } from './client/host-platform-state';
import { MessageBroker } from './host/message-broker';
import { PlatformTopics } from './ɵmessaging.model';
import { mergeMap, takeUntil } from 'rxjs/operators';

/**
 * The central class of the SCION microfrontend platform.
 *
 * This class cannot be instantiated; all functionality is provided by static methods.
 *
 * Features include:
 * - cross-origin messaging between applications
 * - concept of intents and capabilities to interact with microfrontends
 * - registry of installed microfrontends
 * - outlet to embed a microfrontend
 * - ...
 *
 * TODO: Complete feature list
 */
export const MicrofrontendPlatform = new class {

  constructor() {
    window.addEventListener('beforeunload', () => this.destroy(), {once: true});
  }

  /**
   * Invoke from a microfrontend application to connect to the platform.
   *
   * Note: This application must be a direct or indirect subframe of the host-app; in other words, the window of the host-app must be contained somewhere in the window parent hierarchy.
   *
   * @param  config
   *         Configures this application as microfrontend platform client.
   * @return A Promise that resolves when the platform started successfully, or that rejects if startup fails.
   */
  public forClient(config: ClientConfig): Promise<void> {
    return this.startPlatform(() => {
        Beans.register(ClientConfig, {useValue: config});
        Beans.registerIfAbsent(Logger);
        Beans.registerIfAbsent(HttpClient);
        Beans.registerIfAbsent(MessageClient, provideMessageClient(config.symbolicName, config.messaging));
        Beans.register(HostPlatformState);
      },
    );
  }

  /**
   * Invoke from the host application to start the platform.
   *
   * @param  platformConfig
   *         Defines the applications running in the platform. You can provide a static configuration or a loader to load the configuration from remote.
   *         If using a static config, provide it either as an array of {@link ApplicationConfig}s or as a {@link PlatformConfig} object.
   * @param  clientConfig
   *         Provide a client configuration if the host app also acts as a client app. If set, the host app can interact with other clients.
   * @return A Promise that resolves when the platform started successfully, or that rejects if startup fails.
   */
  public forHost(platformConfig: ApplicationConfig[] | PlatformConfig | Type<PlatformConfigLoader>, clientConfig?: ClientConfig): Promise<void> {
    return this.startPlatform(() => {
        Beans.registerIfAbsent(Logger);
        Beans.register(PlatformProperties);
        Beans.registerIfAbsent(HttpClient);
        Beans.register(PlatformConfigLoader, createConfigLoaderBeanDescriptor(platformConfig));
        Beans.register(ManifestRegistry);
        Beans.register(ApplicationRegistry);
        Beans.registerIfAbsent(PlatformMessageClient, provideMessageClient(PLATFORM_SYMBOLIC_NAME, clientConfig && clientConfig.messaging));

        Beans.registerInitializer({useClass: PlatformInitializer});
        Beans.registerInitializer({useClass: ManifestCollector});
        Beans.register(HostPlatformState);

        if (clientConfig) {
          Beans.register(ClientConfig, {useValue: clientConfig});
          Beans.registerIfAbsent(MessageClient, provideMessageClient(clientConfig.symbolicName, clientConfig.messaging));
        }

        // Construct the bean manager instantly to receive connect requests of clients.
        Beans.registerIfAbsent(MessageBroker, {useValue: new MessageBroker(), destroyPhase: PlatformStates.Stopped});

        // Notify clients about host platform state changes.
        Beans.get(PlatformState).state$
          .pipe(
            mergeMap(state => Beans.get(PlatformMessageClient).publish$(PlatformTopics.HostPlatformState, state, {retain: true})),
            takeUntil(from(Beans.get(PlatformState).whenState(PlatformStates.Stopping))),
          )
          .subscribe();
      },
    );
  }

  /**
   * Checks if this application is running in the context of the microfrontend platform.
   */
  public isRunningStandalone(): boolean {
    throw Error('[UnsupportedOperationError] Method not implemented yet.'); // TODO implement this functionality
  }

  /**
   * Destroys this platform and releases resources allocated.
   */
  public async destroy(): Promise<void> {
    await Beans.get(PlatformState).enterState(PlatformStates.Stopping);
    Beans.destroy();
    await Beans.get(PlatformState).enterState(PlatformStates.Stopped);
  }

  /** @internal **/
  public async startPlatform(startupFn: () => void): Promise<void> {
    await Beans.get(PlatformState).enterState(PlatformStates.Starting);
    try {
      startupFn();

      return Beans.runInitializers()
        .then(() => Beans.get(PlatformState).enterState(PlatformStates.Started))
        .catch(async error => {
          await Beans.destroy();
          return Promise.reject(`[PlatformStartupError] Microfrontend platform failed to start: ${error}`);
        });
    }
    catch (error) {
      await Beans.destroy();
      return Promise.reject(`[PlatformStartupError] Microfrontend platform failed to start: ${error}`);
    }
  }
};

/**
 * Creates a {@link PlatformConfigLoader} from the given config.
 */
function createConfigLoaderBeanDescriptor(config: ApplicationConfig[] | PlatformConfig | Type<PlatformConfigLoader>): InstanceConstructInstructions {
  if (typeof config === 'function') {
    return {useClass: config}; // {PlatformConfigLoader} class
  }
  else if (Array.isArray(config)) { // array of {ApplicationConfig} objects
    return {useValue: new StaticPlatformConfigLoader({apps: config, properties: {}})};
  }
  else { // {PlatformConfig} object
    return {useValue: new StaticPlatformConfigLoader(config)};
  }
}

function provideMessageClient(clientAppName: string, config?: { brokerDiscoverTimeout?: number, deliveryTimeout?: number }): BeanInstanceConstructInstructions {
  return {
    useFactory: (): MessageClient => {
      const discoveryTimeout = Defined.orElse(config && config.brokerDiscoverTimeout, 10000);
      const deliveryTimeout = Defined.orElse(config && config.deliveryTimeout, 10000);
      return new ɵMessageClient(clientAppName, {discoveryTimeout, deliveryTimeout});
    },
    eager: true,
    destroyPhase: PlatformStates.Stopped,
  };
}

class StaticPlatformConfigLoader implements PlatformConfigLoader {

  constructor(private _config: PlatformConfig) {
  }

  public load$(): Observable<PlatformConfig> {
    return of(this._config);
  }
}
