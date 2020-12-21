/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ComponentType } from '@angular/cdk/portal';
import { ApplicationManifest, PlatformConfig } from '@scion/microfrontend-platform';
import { Type } from '@angular/core';
import { MicrofrontendPlatformConfigLoader } from './microfrontend-platform/microfrontend-platform-config-loader';
import { LogAppender, LogLevel } from './logging';

/**
 * Configures the SCION Workbench module.
 */
export abstract class WorkbenchModuleConfig {

  /**
   * Specifies whether to reuse routes of activities.
   * If set to 'true', which is by default, activity components are not destroyed when toggling the activity.
   */
  public abstract reuseActivityRoutes?: boolean;

  /**
   * Allows customizing the appearance of a view tab by providing a custom view tab component.
   *
   * Inject {@link WorkbenchView} and {@link VIEW_TAB_CONTEXT} token into the component to get a reference to the view and the rendering context.
   *
   *
   * ---
   * Example:
   *
   * @Component(...)
   * export class ViewTabContentComponent {
   *   constructor(view: WorkbenchView, @Inject(VIEW_TAB_CONTEXT) context: ViewTabContext) {}
   * }
   */
  public abstract viewTabComponent?: ComponentType<any>;

  /**
   * Controls which built-in menu items to display in the view context menu.
   */
  public abstract viewMenuItems?: ViewMenuItemsConfig;

  /**
   * Configures logging for the workbench.
   */
  public abstract logging?: {
    /**
     * Sets the minimum severity level a log message must have in order to be logged. By default, if not specified, it is set to {@link LogLevel#INFO}.
     *
     * At runtime, you can change the minimum required log level by setting the `loglevel` query parameter.
     */
    logLevel?: LogLevel,
    /**
     * Registers log appenders to output log messages. Multiple appenders are allowed. By default, if not specified, log messages are written to the console.
     */
    logAppenders?: Type<LogAppender>[];
  };

  /**
   * Allows configuring the workbench startup.
   *
   * The {@link WorkbenchLauncher} is used to start the workbench. During startup, it runs registered workbench initializers
   * and waits for them to complete. You can inject {@link WorkbenchStartup} to get notified when the startup is complete.
   *
   * Refer to {@link WorkbenchInitializer} to learn how to register a workbench initializer.
   */
  public abstract startup?: {
    /**
     * Configures the workbench launching strategy.
     *
     *  - **APP_INITIALIZER**
     *   Launches the workbench in an Angular `APP_INITIALIZER`, which is before bootstrapping the app component.
     *
     * - **LAZY** (which is the default)
     *   Launches the workbench at the latest when bootstrapping the workbench root component `<wb-workbench>`.
     *
     *   With this strategy, you are flexible when to start the workbench. You can start the workbench explicitly by
     *   calling {@link WorkbenchLauncher#launch}, e.g., to launch the workbench from a route guard or app initializer,
     *   or start it automatically when adding the workbench root component `<wb-workbench>` to the Angular component
     *   tree.
     */
    launcher?: 'APP_INITIALIZER' | 'LAZY';

    /**
     * The splash component to display when mounting the workbench root component `<wb-workbench>` to the DOM before the
     * workbench startup has finished.
     *
     * Note that when launching the workbench in an Angular `APP_INITIALIZER`, no splash will display since the workbench
     * will start upfront.
     */
    splash?: ComponentType<any>;
  };

  /**
   * Enables microfrontend support in the workbench, allowing the integration of microfrontends as workbench views.
   *
   * The workbench allows any web page to be embedded as a workbench view. The web page has to provide a manifest in which it
   * describes its views. It is conceivable that the manifest is provided by another application, e.g., when integrating
   * third-party applications where no adaptation is possible. If embedded content needs to interact with the workbench,
   * it can use the library `@scion/workbench-client`, a pure TypeScript library based on the web stack-agnostic
   * `@scion/microfrontend-platform` library.
   *
   * The workbench integrates microfrontends through so-called intents, a mechanism known from Android development, enabling
   * controlled collaboration across application boundaries. SCION DevTools can help to inspect integrated applications and
   * dependencies. They are available in the form of a microfrontend that you can embed like any other microfrontend.
   *
   * To learn more about the SCION Microfrontend Platform, refer to https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform.
   */
  public abstract microfrontends?: WorkbenchMicrofrontendConfig;
}

/**
 * Enables microfrontend support in the workbench, allowing the integration of microfrontends as workbench views.
 */
export interface WorkbenchMicrofrontendConfig {
  /**
   * Configures applications, so-called micro applications, to contribute workbench views and interact with the workbench using the SCION Microfrontent Platform.
   *
   * You can pass the configuration statically in the form of a {@link PlatformConfig} object or load it asynchronously using a loader,
   * e.g., for loading the config over the network.
   */
  platform: PlatformConfig | Type<MicrofrontendPlatformConfigLoader>;
  /**
   * Specifies how the workbench host app should register with the SCION Microfrontend Platform.
   *
   * Configuring the platform host is optional. The platform host is the app that starts the SCION Workbench and SCION Microfrontend Platform,
   * i.e., where you call `WorkbenchModule.forRoot(...)`. If the host wants to interact or communicate with integrated applications, configuring
   * the platform host is required. You can either provide its manifest programmatically via the host config or have it loaded from an URL.
   * If loading it from an URL, you have to register the platform host application as a micro application in the {@link platform} property and
   * set its symbolic name accordingly.
   */
  platformHost?: {
    /**
     * The symbolic name of the platform host is used to link to its manifest, mandatory if you load the manifest from an URL.
     * If not specified, `workbench-host` is used as the symbolic name.
     */
    symbolicName?: string
    /**
     * Manifests the capabilities and intentions of the platform host. Alternatively, you can provide its manifest from an URL by registering
     * the platform host application in the {@link platform} property.
     */
    manifest?: ApplicationManifest;
  };
}

/**
 * Controls which built-in menu items to display in the view context menu.
 */
export interface ViewMenuItemsConfig {
  close?: MenuItemConfig;
  closeOthers?: MenuItemConfig;
  closeAll?: MenuItemConfig;
  closeToTheRight?: MenuItemConfig;
  closeToTheLeft?: MenuItemConfig;
  moveUp?: MenuItemConfig;
  moveRight?: MenuItemConfig;
  moveDown?: MenuItemConfig;
  moveLeft?: MenuItemConfig;
  moveBlank?: MenuItemConfig;
}

export interface MenuItemConfig {
  visible?: boolean;
  text?: string;
  accelerator?: string[];
  group?: string;
}
