/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentType} from '@angular/cdk/portal';
import {Signal, Type} from '@angular/core';
import {LogAppender, LogLevel} from './logging';
import {MicrofrontendPlatformConfig} from '@scion/microfrontend-platform';
import {MicrofrontendPlatformConfigLoader} from './microfrontend-platform/microfrontend-platform-config-loader';
import {WorkbenchLayoutFn, WorkbenchPerspectives} from './perspective/workbench-perspective.model';
import {WorkbenchStorage} from './storage/workbench-storage';

/**
 * Configuration of the SCION Workbench.
 */
export abstract class WorkbenchConfig {

  /**
   * Specifies the component to display a view tab, enabling custom design or functionality.
   *
   * The component can inject {@link WorkbenchView} and {@link VIEW_TAB_RENDERING_CONTEXT} to get a reference to the view and the rendering context.
   */
  public abstract viewTabComponent?: ComponentType<unknown>;

  /**
   * Specifies the component to display if no route matches the requested URL.
   *
   * This happens when navigating to a route that does not exist or when loading the application, and the routes have changed since the last use.
   *
   * The component can inject {@link WorkbenchView} to get a reference to the view, e.g., to obtain the requested URL.
   */
  public abstract pageNotFoundComponent?: ComponentType<unknown>;

  /**
   * Controls which built-in menu items to display in the view context menu.
   */
  public abstract viewMenuItems?: ViewMenuItemsConfig;

  /**
   * Configures the workbench startup.
   *
   * The {@link WorkbenchLauncher} is used to start the workbench. During startup, it runs registered workbench initializers
   * and waits for them to complete. You can inject {@link WorkbenchStartup} to get notified when the startup is complete.
   *
   * Refer to {@link WorkbenchInitializer} to learn how to register a workbench initializer.
   */
  public abstract startup?: {
    /**
     * Configures the workbench launching strategy. Defaults to `LAZY` if not specified.
     *
     *  - **APP_INITIALIZER**
     *   Launches the workbench in an Angular `APP_INITIALIZER`, which is before bootstrapping the app component.
     *
     * - **LAZY**
     *   Launches the workbench at the latest when bootstrapping the workbench root component `<wb-workbench>`.
     *
     *   With this strategy, you are flexible when to start the workbench. You can start the workbench explicitly by
     *   calling {@link WorkbenchLauncher#launch}, e.g., to launch the workbench from a route guard or app initializer,
     *   or start it automatically when adding the workbench root component `<wb-workbench>` to the Angular component
     *   tree.
     */
    launcher?: 'APP_INITIALIZER' | 'LAZY';

    /**
     * Specifies the component to display when mounting the workbench root component `<wb-workbench>` to the DOM before the
     * workbench startup has finished.
     *
     * Note that when launching the workbench in an Angular `APP_INITIALIZER`, no splash will display since the workbench
     * will start upfront.
     */
    splash?: ComponentType<unknown>;
  };

  /**
   * Configures microfrontend support in the workbench, allowing the integration of microfrontends as workbench views or
   * workbench popups.
   *
   * The workbench uses the "SCION Microfrontend Platform" for providing microfrontend support. To learn more about the
   * "SCION Microfrontend Platform", refer to https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform.
   *
   * The workbench allows any web page to be embedded as a workbench view or workbench popup. The web app has to provide
   * a manifest in which it describes its views and popups. To integrate a third-party application where customization is not
   * possible, the host application can provide a manifest for that application. If embedded content needs to interact with
   * the workbench, the web app can use the library `@scion/workbench-client`, a pure TypeScript library based on the
   * web stack-agnostic `@scion/microfrontend-platform` library.
   *
   * The workbench integrates microfrontends through so-called intents, a mechanism known from Android development, enabling
   * controlled collaboration across application boundaries. "SCION Microfrontend Platform DevTools" can help to inspect
   * integrated applications and dependencies. The DevTools are available in the form of a microfrontend that can be embedded
   * like any other microfrontend. Refer to the documentation for detailed instructions on how to integrate
   * "SCION Microfrontend Platform DevTools".
   *
   * Typically, the host app provides API to integrated micro apps via the intent mechanism. Consider registering intent handlers
   * under the DI token {@link MICROFRONTEND_PLATFORM_POST_STARTUP}.
   */
  public abstract microfrontendPlatform?: MicrofrontendPlatformConfig | Type<MicrofrontendPlatformConfigLoader>;

  /**
   * Defines the workbench layout. Multiple layouts can be defined in the form of perspectives.
   * If not set, defaults to a layout with only a main area.
   *
   * See {@link WorkbenchLayoutFn} for more information and an example.
   */
  public abstract layout?: WorkbenchLayoutFn | WorkbenchPerspectives;

  /**
   * Provides persistent storage to the SCION Workbench.
   *
   * If not set, the workbench uses the browser's local storage as persistent storage.
   */
  public abstract storage?: Type<WorkbenchStorage>;

  /**
   * Configures the behavior of workbench dialogs.
   */
  public abstract dialog?: {
    /**
     * Configures the area to block for application-modal dialogs. If not set, defaults to `workbench`.
     *
     * - **workbench:** blocks the {@link WorkbenchComponent|workbench element}, still allowing interaction with elements outside the workbench element.
     *
     * - **viewport** blocks the browser viewport, preventing interaction with the application until application-modal dialogs are closed.
     */
    modalityScope?: 'workbench' | 'viewport';
  };

  /**
   * Configures logging for the workbench.
   */
  public abstract logging?: {
    /**
     * Sets the minimum severity level a log message must have in order to be logged. By default, if not specified, it is set to {@link LogLevel#INFO}.
     *
     * At runtime, you can change the minimum required log level by setting the `loglevel` query parameter.
     */
    logLevel?: LogLevel;
    /**
     * Registers log appenders to output log messages. Multiple appenders are allowed. By default, if not specified, log messages are written to the console.
     */
    logAppenders?: Type<LogAppender>[];
  };
}

/**
 * Configuration of built-in menu items in the view's context menu.
 *
 * Each property represents a menu item, allowing customization of visibility, text, accelerators, and more.
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
  moveToNewWindow?: MenuItemConfig;
}

/**
 * Configures a built-in menu item.
 */
export interface MenuItemConfig {
  visible?: boolean;
  /**
   * Specifies the text of this menu item.
   *
   * Can be a string or a function that returns a string or a {@link Signal}.
   *
   * The function can call `inject` to get any required dependencies, or use `toSignal` to convert an observable to a signal.
   */
  text?: string | (() => string | Signal<string>);
  accelerator?: string[];
  group?: string;
  cssClass?: string | string[];
}
