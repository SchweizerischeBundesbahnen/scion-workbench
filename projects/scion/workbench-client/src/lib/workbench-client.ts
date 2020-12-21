/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans } from '@scion/toolkit/bean-manager';
import { WorkbenchViewInitializer } from './view/workbench-view-initializer';
import { MicroApplicationConfig, MicrofrontendPlatform } from '@scion/microfrontend-platform';
import { WorkbenchRouter } from './routing/workbench-router';

/**
 * **SCION Workbench Client provides core API for a web app to interact with SCION Workbench and other microfrontends.**
 *
 * It is a pure TypeScript library based on the framework-agnostic `@scion/microfrontend-platform` library and can be used with any web stack.
 *
 * You can use the `Beans` object to get references to services to interact with the SCION Workbench and the SCION Microfrontend Platform.
 *
 * #### Core services include:
 *
 * - {@link WorkbenchRouter} for navigating to a microfrontend in a workbench view.
 * - {@link WorkbenchView} for interacting with the workbench view, such as setting view tab properties or closing the view.
 * - `MessageClient` for sending or receiving messages between micro applications.
 * - `IntentClient` for issuing or receiving intents between micro applications.
 * - `ManifestService` for reading and registering capabilities at runtime.
 * - `SciRouterOutletElement` for embedding microfrontends.
 * - `OutletRouter` for navigating to a site in a router outlet element.
 * - `ContextService` for looking up contextual data set on a router outlet.
 * - `PreferredSizeService` for a microfrontend to report its preferred size.
 * - `FocusMonitor` for observing if the microfrontend has received focus or contains embedded web content that has received focus.
 * - `Activator` for initializing and connecting to the platform when the user loads the workbench into his browser.
 *
 * For example, you can obtain the workbench router as follows:
 *
 * ```ts
 * const router = Beans.get(WorkbenchRouter)
 * ```
 *
 * Below is a summary of the core concepts of the SCION Microfrontend Platform.
 *
 * #### Host Application and Micro Applications
 * The host application, sometimes also called the container application, provides the top-level integration container for microfrontends. Typically, it is the web app
 * which the user loads into his browser and provides the main application shell, defining areas to embed microfrontends. The host application has SCION Workbench installed,
 * registers micro apps and starts the SCION Microfrontend Platform in host mode.
 *
 * A micro application deals with well-defined business functionality. It is a regular web application that provides one or more microfrontends. SCION Microfrontend Platform
 * uses iframes to embed microfrontends; thus, any web page can be integrated as a microfrontend. A micro application can communicate with other micro applications safely
 * using the platform's cross-origin messaging API. A micro application has to provide an application manifest which to register in the host application.
 *
 * For more information, see the chapter [Core Concepts](https://scion-microfrontend-platform-developer-guide.now.sh/#_core_concepts)
 * of the SCION Microfrontend Platform Developer's Guide.
 *
 * #### Embedding of Microfrontends
 * You can embed microfrontends using the `<sci-router-outlet>` web component. Web content displayed in the web component is controlled by the `OutletRouter`.
 *
 * For more information, see the chapter [Embedding Microfrontends](https://scion-microfrontend-platform-developer-guide.now.sh/#chapter:embedding-microfrontends)
 * of the SCION Microfrontend Platform Developer's Guide.
 *
 * #### Cross-Application Communication
 * You can interact with other micro applications via messaging or through so-called intents. Intents are a mechanism known from Android development,
 * enabling controlled collaboration across application boundaries.
 *
 * For more information, see the chapters [Cross-Application Communication](https://scion-microfrontend-platform-developer-guide.now.sh/#chapter:cross-application-communication)
 * and [Intention API](https://scion-microfrontend-platform-developer-guide.now.sh/#chapter:intention-api) of the SCION Microfrontend Platform Developer's Guide.
 *
 * #### Activation
 * You can provide an activator to connect to the platform when the user loads the host app into his browser, allowing to initialize and install message listeners for interacting
 * with other micro applications. Starting an activator may take some time. In order not to miss any messages, you can instruct the platform host to wait until you signal
 * readiness.
 *
 * For more information, see the chapter [Activator](https://scion-microfrontend-platform-developer-guide.now.sh/#chapter:activator) of the SCION Microfrontend
 * Platform Developer's Guide.
 *
 * See our [Developer's Guide](https://scion-microfrontend-platform-developer-guide.now.sh) for the full documentation about the
 * [SCION Microfrontend Platform](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform).
 */
export class WorkbenchClient {

  private constructor() {
  }

  /**
   * Connects a registered micro application to the SCION Workbench and SCION Microfrontend Platform.
   *
   * When connected to the platform, the micro application can interact with the workbench and other micro applications. Typically, the
   * micro application connects to the workbench during bootstrapping, that is, before displaying content to the user. In Angular, for
   * example, this can be done in an app initializer.
   *
   * See `MicrofrontendPlatform` for more information about connecting to the platform host.
   *
   * @param  config - Identity of the micro application. The app must be registered in the workbench as micro app.
   * @return A Promise that resolves when connected successfully to the workbench, or that rejects otherwise.
   */
  public static async connect(config: MicroApplicationConfig): Promise<void> {
    Beans.register(WorkbenchRouter);
    Beans.registerInitializer({useClass: WorkbenchViewInitializer});
    await MicrofrontendPlatform.connectToHost(config);
  }
}
