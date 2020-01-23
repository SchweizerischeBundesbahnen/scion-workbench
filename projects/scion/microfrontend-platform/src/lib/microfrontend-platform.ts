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
import { ManifestRegistry } from './host/manifest-registry/manifest-registry';
import { ApplicationRegistry } from './host/application-registry';
import { BeanInstanceConstructInstructions, Beans, InstanceConstructInstructions, Type } from './bean-manager';
import { ɵMessageClient } from './client/ɵmessage-client';
import { PlatformState, PlatformStates } from './platform-state';
import { PlatformConfigLoader } from './host/platform-config-loader';
import { from, Observable, of } from 'rxjs';
import { ClientConfig } from './client/client-config';
import { ApplicationConfig, PlatformConfig } from './host/platform-config';
import { PlatformPropertyService } from './platform-property-service';
import { Logger } from './logger';
import { HttpClient } from './host/http-client';
import { ManifestCollector } from './host/manifest-collector';
import { PlatformMessageClient } from './host/platform-message-client';
import { PLATFORM_SYMBOLIC_NAME } from './host/platform.constants';
import { Defined } from '@scion/toolkit/util';
import { HostPlatformState } from './client/host-platform-state';
import { MessageBroker } from './host/message-broker/message-broker';
import { PlatformTopics } from './ɵmessaging.model';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { OutletRouter } from './client/router-outlet/outlet-router';
import { SciRouterOutletElement } from './client/router-outlet/router-outlet.element';
import { FocusInEventDispatcher } from './client/focus/focus-in-event-dispatcher';
import { FocusMonitor } from './client/focus/focus-monitor';
import { ContextService } from './client/context/context-service';
import { RouterOutletUrlAssigner } from './client/router-outlet/router-outlet-url-assigner';
import { IS_PLATFORM_HOST } from './platform.model';
import { RelativePathResolver } from './client/router-outlet/relative-path-resolver';
import { ClientRegistry } from './host/message-broker/client.registry';
import { FocusTracker } from './host/focus/focus-tracker';
import { PreferredSizeService } from './client/preferred-size/preferred-size-service';
import { MouseMoveEventDispatcher } from './client/mouse-event/mouse-move-event-dispatcher';
import { MouseUpEventDispatcher } from './client/mouse-event/mouse-up-event-dispatcher';
import { HostPlatformAppProvider } from './host/host-platform-app-provider';
import { KeyboardEventDispatcher } from './client/keyboard-event/keyboard-event-dispatcher';
import { ManifestService } from './client/manifest-service';
import { ɵManifestRegistry } from './host/manifest-registry/ɵmanifest-registry';
import { ApplicationActivator } from './host/activator/application-activator';
import { PlatformManifestService } from './client/platform-manifest-service';

/**
 * SCION Microfrontend Platform provides the building blocks for integrating microfrontends based on iframes.
 *
 * It is a pure TypeScript framework allowing to integrate any web content. It comes with a powerful messaging facility for
 * cross-origin intent- or topic-based communication supporting wildcard addressing, request-response message exchange pattern,
 * retained messaging and more. Web content is embedded using a responsive web component which encapsulates the iframe.
 * The component solves many of the cumbersome quirks of iframes and sets up a context in which data can be made available
 * to the embedded content.
 *
 * @see MessageClient
 * @see SciRouterOutletElement
 * @see OutletRouter
 * @see ContextService
 * @see PreferredSizeService
 * @see ManifestService
 * @see FocusMonitor
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
        Beans.registerInitializer(() => SciRouterOutletElement.define());
        // Obtain all platform properties before signalling the platform as started to allow synchronous retrieval of platform properties.
        Beans.registerInitializer(async () => {
          if (!await MicrofrontendPlatform.isRunningStandalone()) {
            await Beans.get(PlatformPropertyService).whenPropertiesLoaded;
          }
        });

        Beans.register(IS_PLATFORM_HOST, {useValue: false});
        Beans.register(ClientConfig, {useValue: config});
        Beans.register(PlatformPropertyService, {eager: true});
        Beans.registerIfAbsent(Logger);
        Beans.registerIfAbsent(HttpClient);
        Beans.registerIfAbsent(MessageClient, provideMessageClient(config.symbolicName, config.messaging));
        Beans.register(HostPlatformState);
        Beans.registerIfAbsent(OutletRouter);
        Beans.registerIfAbsent(RelativePathResolver);
        Beans.registerIfAbsent(RouterOutletUrlAssigner);
        Beans.register(FocusInEventDispatcher, {eager: true});
        Beans.register(FocusMonitor);
        Beans.register(MouseMoveEventDispatcher, {eager: true});
        Beans.register(MouseUpEventDispatcher, {eager: true});
        Beans.register(PreferredSizeService);
        Beans.register(ContextService);
        Beans.register(ManifestService);
        Beans.register(KeyboardEventDispatcher, {eager: true});
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
        Beans.registerInitializer({useClass: ManifestCollector});

        Beans.register(IS_PLATFORM_HOST, {useValue: true});
        Beans.register(HostPlatformAppProvider);
        Beans.register(ClientRegistry);
        Beans.registerIfAbsent(Logger);
        Beans.register(PlatformPropertyService, {eager: true});
        Beans.registerIfAbsent(HttpClient);
        Beans.register(PlatformConfigLoader, createConfigLoaderBeanDescriptor(platformConfig));
        Beans.register(ManifestRegistry, {useClass: ɵManifestRegistry, eager: true, destroyPhase: PlatformStates.Stopped});
        Beans.register(ApplicationRegistry, {eager: true, destroyPhase: PlatformStates.Stopped});
        Beans.registerIfAbsent(PlatformMessageClient, provideMessageClient(PLATFORM_SYMBOLIC_NAME, clientConfig && clientConfig.messaging));
        Beans.register(HostPlatformState);
        Beans.register(ContextService);
        Beans.register(FocusTracker, {eager: true});
        Beans.register(FocusInEventDispatcher, {eager: true});
        Beans.register(MouseMoveEventDispatcher, {eager: true});
        Beans.register(MouseUpEventDispatcher, {eager: true});
        Beans.register(ApplicationActivator, {eager: true});
        Beans.register(PlatformManifestService);

        // Construct the bean manager instantly to receive connect requests of clients.
        Beans.registerIfAbsent(MessageBroker, {useValue: new MessageBroker(), destroyPhase: PlatformStates.Stopped});

        if (clientConfig) {
          Beans.registerInitializer(() => SciRouterOutletElement.define());
          Beans.register(ClientConfig, {useValue: clientConfig});
          Beans.registerIfAbsent(MessageClient, provideMessageClient(clientConfig.symbolicName, clientConfig.messaging));
          Beans.registerIfAbsent(OutletRouter);
          Beans.registerIfAbsent(RelativePathResolver);
          Beans.registerIfAbsent(RouterOutletUrlAssigner);
          Beans.register(FocusMonitor);
          Beans.register(PreferredSizeService);
          Beans.register(ManifestService);
          Beans.register(KeyboardEventDispatcher, {eager: true});
        }
        else {
          Beans.registerIfAbsent(MessageClient, {useExisting: PlatformMessageClient});
        }

        // Notify clients about host platform state changes.
        Beans.get(PlatformState).state$
          .pipe(
            mergeMap(state => Beans.get(PlatformMessageClient).publish$(PlatformTopics.HostPlatformState, state, {retain: true})),
            takeUntil(from(Beans.get(PlatformState).whenState(PlatformStates.Stopping))),
          )
          .subscribe();
      },
    ).then(() => Beans.get(HostPlatformState).whenStarted()); // Wait until the host platform reported its 'started' state before signalling the platform as started.
  }

  /**
   * Checks if this microfrontend is connected to the platform host. If not, the client platform may not be started,
   * or the microfrontend is running as a top-level app in the browser.
   */
  public async isRunningStandalone(): Promise<boolean> {
    return Beans.get(PlatformState).state === PlatformStates.Stopped || !(await Beans.get(MessageClient).isConnected());
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
