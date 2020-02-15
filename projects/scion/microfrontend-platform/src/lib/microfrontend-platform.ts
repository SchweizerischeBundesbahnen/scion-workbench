/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { MessageClient } from './client/messaging/message-client';
import { ManifestRegistry } from './host/manifest-registry/manifest-registry';
import { ApplicationRegistry } from './host/application-registry';
import { BeanInstanceConstructInstructions, Beans, InstanceConstructInstructions, Type } from './bean-manager';
import { ɵMessageClient } from './client/messaging/ɵmessage-client';
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
import { ManifestService } from './client/manifest-registry/manifest-service';
import { ɵManifestRegistry } from './host/manifest-registry/ɵmanifest-registry';
import { ApplicationActivator } from './host/activator/application-activator';
import { PlatformManifestService } from './client/manifest-registry/platform-manifest-service';

window.addEventListener('beforeunload', () => MicrofrontendPlatform.destroy(), {once: true});

/**
 * **SCION Microfrontend Platform provides the building blocks for integrating microfrontends based on iframes.**
 *
 * SCION Microfrontend Platform is a vanilla TypeScript framework allowing us to integrate any web content on client side. It comes with a robust
 * messaging facility for cross-origin intent- and topic-based communication supporting wildcard addressing, request-response message exchange pattern,
 * retained messaging, and more. Web content is embedded using a web component outlet that solves many of the cumbersome quirks of iframes.
 *
 * The platform is UI framework agnostic and does not include or impose a UI. The platform integrates microfrontends by using iframes to provide the highest
 * possible isolation between the microfrontends. Iframes, however, require microfrontends to have a fast startup time and impose some restrictions.
 * For example, sharing state is more difficult because each microfrontend is mounted in a separate iframe. As for UI, microfrontends are trapped
 * in their iframe boundary, which can be a strong limitation, particularly for overlays.
 *
 * The platform aims to remove iframe restrictions where appropriate. For example, the platform bubbles selected keyboard events across iframe
 * boundaries, lets you determine if the focus is within a microfrontend, or changes the iframe size to the preferred size of embedded content.
 * You can further associate contextual data with an iframe that is then available in embedded content.
 *
 * The platform supports the concept of intent-based communication, also known from the Android platform.
 * To interact with functionality available in the system, apps declare a respective intention in a manifest and are then qualified to issue an intent to
 * interact. Apps can also provide capabilities. Capabilities are the counterpart to intentions and allow an app to provide functionality that qualified apps
 * can call via intent. A capability can either be application-private or available to all apps in the system.
 *
 * Intentions or capabilities are formulated in an abstract way, consist of a type and qualifier, and should include enough information to describe it.
 * The enforced declaration allows analyzing which app depends on each other and to look up capabilities for a flexible composition of web content.
 *
 * @see {@link MessageClient}
 * @see {@link SciRouterOutletElement}
 * @see {@link OutletRouter}
 * @see {@link ContextService}
 * @see {@link PreferredSizeService}
 * @see {@link ManifestService}
 * @see {@link FocusMonitor}
 * @see {@link Intention}
 * @see {@link CapabilityProvider}
 * @see {@link ActivatorProvider}
 * @see {@link Beans}
 *
 * @category Platform
 */
// @dynamic `ng-packagr` does not support lamdas in statics if `strictMetaDataEmit` is enabled. `ng-packagr` is used to build this library. See https://github.com/ng-packagr/ng-packagr/issues/696#issuecomment-373487183.
export class MicrofrontendPlatform {

  /**
   * Starts the platform in *host-mode* in the host app.
   *
   * The host app is the web application which the user loads into his browser. It serves as container application for all microfrontends,
   * provides the main layout of the app and defines areas in which to host microfrontends.
   *
   * In the host app, the platform is started in host-mode, thus acting as mediator for inter-microfrontend interaction. It must be started only once.
   *
   * The platform allows registering a client in the host app. This client can, for example, look up capabilities to display a portal, a top-level navigation,
   * or something alike. This client has no extra privileges, thus must also register a manifest in order to interact with the platform.
   * However, the host app client does not need an activator because it is always running.
   *
   * Typically, the platform is started during bootstrapping or initialization, that is, before displaying content to the user.
   * In Angular, for example, the platform should be started in an app initializer.
   *
   * @param  platformConfig - Platform config declaring the apps allowed to interact with the platform. The config can be a static app list, or
   *         provided via {@link PlatformConfigLoader} allowing a flexible setup, e.g. to load the config from a backend.
   * @param  clientConfig - Client config of the app running in the host app; only required if running a client app in the host app.
   * @return A Promise that resolves when the platform started successfully, or that rejects if startup fails.
   */
  public static forHost(platformConfig: ApplicationConfig[] | PlatformConfig | Type<PlatformConfigLoader>, clientConfig?: ClientConfig): Promise<void> {
    return MicrofrontendPlatform.startPlatform(() => {
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
   * Starts the platform in *client-mode*. Invoke this method from inside a microfrontend to connect to the host platform.
   * When connected, the microfrontend can interact with the platform, i.e. sending and receiving messages, issuing and handling intents,
   * looking up capabilities, and more.
   *
   * As a prerequisite, the client app must be a registered app in the host app. Otherwise, the app cannot connect to the platform. Also, the `Window`
   * of the host app must be contained somewhere in the window parent hierarchy of the microfrontend.
   *
   * Typically, a microfrontend connects to the platform during bootstrapping or initialization, that is, before displaying content to the user.
   * In Angular, for example, the platform should be started in an app initializer.
   *
   * The platform must also be started for activator entry points, if any. An activator is a microfrontend without a user interface to perform operations
   * in the background. Activators are loaded on platform startup to interact with the system even when no microfrontend of that app is displaying, e.g, to
   * handle intents, or to flexibly provide capabilities.
   *
   * @param  config - Identity and config of this app.
   * @return A Promise that resolves when the platform started successfully, or that rejects if startup fails.
   */
  public static forClient(config: ClientConfig): Promise<void> {
    return MicrofrontendPlatform.startPlatform(() => {
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
   * Checks if this microfrontend is connected to the platform host. If not, the client platform may not be started,
   * or the microfrontend is running as a top-level app in the browser.
   */
  public static async isRunningStandalone(): Promise<boolean> {
    return Beans.get(PlatformState).state === PlatformStates.Stopped || !(await Beans.get(MessageClient).isConnected());
  }

  /**
   * Destroys this platform and releases resources allocated.
   *
   * @return a Promise that resolves once the platformed stopped.
   */
  public static async destroy(): Promise<void> {
    await Beans.get(PlatformState).enterState(PlatformStates.Stopping);
    Beans.destroy();
    await Beans.get(PlatformState).enterState(PlatformStates.Stopped);
  }

  /** @internal **/
  public static async startPlatform(startupFn: () => void): Promise<void> {
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
}

/**
 * Creates a {@link PlatformConfigLoader} from the given config.
 * @ignore
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

/** @ignore */
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

/** @ignore */
class StaticPlatformConfigLoader implements PlatformConfigLoader {

  constructor(private _config: PlatformConfig) {
  }

  public load$(): Observable<PlatformConfig> {
    return of(this._config);
  }
}
