/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchViewInitializer} from './view/workbench-view-initializer';
import {ConnectOptions, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {WorkbenchRouter} from './routing/workbench-router';
import {WorkbenchPopupService} from './popup/workbench-popup-service';
import {WorkbenchPopupInitializer} from './popup/workbench-popup-initializer';
import {WorkbenchMessageBoxService} from './message-box/workbench-message-box-service';
import {WorkbenchNotificationService} from './notification/workbench-notification-service';
import {WorkbenchThemeMonitor} from './theme/workbench-theme-monitor';
import {ɵWorkbenchThemeMonitor} from './theme/ɵworkbench-theme-monitor';
import {WorkbenchDialogInitializer} from './dialog/workbench-dialog-initializer';
import {WorkbenchDialogService} from './dialog/workbench-dialog-service';
import {ɵWorkbenchDialogService} from './dialog/ɵworkbench-dialog-service';
import {WorkbenchMessageBoxInitializer} from './message-box/workbench-message-box-initializer';
import {ɵWorkbenchMessageBoxService} from './message-box/ɵworkbench-message-box-service';
import {StyleSheetInstaller} from './style-sheet-installer';

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
 * - {@link WorkbenchView} for the microfrontend to interact with the view.
 * - {@link WorkbenchDialogService} for displaying a microfrontend in a dialog.
 * - {@link WorkbenchDialog} for the microfrontend to interact with the dialog.
 * - {@link WorkbenchPopupService} for displaying a microfrontend in a popup.
 * - {@link WorkbenchPopup} for the microfrontend to interact with the popup.
 * - {@link WorkbenchMessageBoxService} for displaying a message.
 * - {@link WorkbenchMessageBox} for the microfrontend to interact with the message box.
 * - {@link WorkbenchNotificationService} for displaying a notification.
 * - `MessageClient` for sending or receiving messages between micro applications.
 * - `IntentClient` for issuing or receiving intents between micro applications.
 * - `ManifestService` for reading and registering capabilities at runtime.
 * - `SciRouterOutletElement` for embedding microfrontends.
 * - `OutletRouter` for navigating to a site in a router outlet element.
 * - `ContextService` for looking up contextual data set on a router outlet.
 * - `PreferredSizeService` for a microfrontend to report its preferred size.
 * - `FocusMonitor` for observing if the microfrontend has received focus or contains embedded web content that has received focus.
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
 * For more information, see the chapter [Core Concepts](https://microfrontend-platform-developer-guide.scion.vercel.app/#_core_concepts)
 * of the SCION Microfrontend Platform Developer's Guide.
 *
 * #### Embedding of Microfrontends
 * You can embed microfrontends using the `<sci-router-outlet>` web component. Web content displayed in the web component is controlled via the `OutletRouter`.
 *
 * For more information, see the chapter [Embedding Microfrontends](https://microfrontend-platform-developer-guide.scion.vercel.app/#chapter:embedding-microfrontends)
 * of the SCION Microfrontend Platform Developer's Guide.
 *
 * #### Cross-Application Communication
 * You can interact with other micro applications via messaging or through so-called intents. Intents are a mechanism known from Android development,
 * enabling controlled collaboration across application boundaries.
 *
 * For more information, see the chapters [Cross-Application Communication](https://microfrontend-platform-developer-guide.scion.vercel.app/#chapter:cross-application-communication)
 * and [Intention API](https://microfrontend-platform-developer-guide.scion.vercel.app/#chapter:intention-api) of the SCION Microfrontend Platform Developer's Guide.
 *
 * #### Activation
 * You can provide an activator to connect to the platform when the user loads the host app into his browser, allowing to initialize and install message listeners for interacting
 * with other micro applications. Starting an activator may take some time. In order not to miss any messages, you can instruct the platform host to wait until you signal
 * readiness.
 *
 * For more information, see the chapter [Activator](https://microfrontend-platform-developer-guide.scion.vercel.app/#chapter:activator) of the SCION Microfrontend
 * Platform Developer's Guide.
 *
 * See our [Developer's Guide](https://microfrontend-platform-developer-guide.scion.vercel.app) for the full documentation about the
 * [SCION Microfrontend Platform](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform).
 */
export class WorkbenchClient {

  private constructor() {
  }

  /**
   * Connects the micro application to the SCION Workbench and SCION Microfrontend Platform.
   *
   * After connected, the micro application can interact with the workbench and other micro applications. Typically, the
   * micro application connects to the workbench during the bootstrapping. In Angular, for example, this can be done in
   * an app initializer.
   *
   * See {@link @scion/microfrontend-platform!MicrofrontendPlatformClient.connect} for more information about connecting to the platform host.
   *
   * @param  symbolicName - Specifies the symbolic name of the micro application. The micro application needs to be registered
   *         in the workbench under that identity.
   * @param  connectOptions - Controls how to connect to the workbench.
   * @return A Promise that resolves once connected to the workbench, or that rejects otherwise.
   */
  public static async connect(symbolicName: string, connectOptions?: ConnectOptions): Promise<void> {
    Beans.register(WorkbenchRouter);
    Beans.register(WorkbenchPopupService);
    Beans.register(WorkbenchNotificationService);
    Beans.register(WorkbenchDialogService, {useClass: ɵWorkbenchDialogService});
    Beans.register(WorkbenchMessageBoxService, {useClass: ɵWorkbenchMessageBoxService});
    Beans.register(WorkbenchThemeMonitor, {useClass: ɵWorkbenchThemeMonitor});
    Beans.register(StyleSheetInstaller, {eager: true});
    Beans.registerInitializer({useClass: WorkbenchViewInitializer});
    Beans.registerInitializer({useClass: WorkbenchPopupInitializer});
    Beans.registerInitializer({useClass: WorkbenchDialogInitializer});
    Beans.registerInitializer({useClass: WorkbenchMessageBoxInitializer});
    await MicrofrontendPlatformClient.connect(symbolicName, connectOptions);
  }
}
