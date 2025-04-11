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
import {WorkbenchTextProviderFn} from './text/workbench-text-provider.model';

/**
 * Configuration of the SCION Workbench.
 */
export abstract class WorkbenchConfig {

  /**
   * Specifies the component to display in `<wb-workbench>` while the workbench is starting.
   *
   * Defaults to a splash showing a loading indicator (ellipsis throbber).
   *
   * Note: No splash screen is displayed if starting the workbench in an app initializer.
   */
  public abstract splashComponent?: ComponentType<unknown>;

  /**
   * Specifies the component to display a view tab, enabling custom design or functionality.
   *
   * The component can inject {@link WorkbenchView} and {@link VIEW_TAB_RENDERING_CONTEXT} to get a reference to the view and the rendering context.
   */
  public abstract viewTabComponent?: ComponentType<unknown>;

  /**
   * Defines the component to display when no route matches the requested path.
   *
   * This can happen when navigating to a non-existent route or after loading the application, if the routes have changed since the user's last session.
   *
   * The component can inject {@link WorkbenchView} to get a reference to the view, e.g., to obtain the requested URL.
   */
  public abstract pageNotFoundComponent?: ComponentType<unknown>;

  /**
   * Controls which built-in menu items to display in the view context menu.
   *
   * Set to `false` to exclude all built-in menu items.
   */
  public abstract viewMenuItems?: ViewMenuItemsConfig | false;

  /**
   * Configures startup of the SCION Workbench.
   *
   * The SCION Workbench starts automatically when the `<wb-workbench>` component is added to the DOM. Alternatively,
   * the workbench can be started manually using {@link WorkbenchLauncher.launch}, such as in an app initializer or a route guard.
   *
   * The application can hook into the startup process of the SCION Workbench by providing one or more initializers to {@link provideWorkbenchInitializer}.
   * Initializers execute at defined points during startup, enabling the application's controlled initialization. The workbench is fully started once
   * all initializers have completed.
   *
   * The application can inject {@link WorkbenchStartup} to check if the workbench has completed startup.
   */
  public abstract startup?: {
    /**
     * Controls when to start the SCION Workbench. Defaults to `LAZY`.
     *
     * - **LAZY**
     *   Starts the workbench when the `<wb-workbench>` component is added to the DOM or manually via {@link WorkbenchLauncher#launch},
     *   e.g., from a route guard or app initializer.
     *
     *  - **APP_INITIALIZER**
     *   Starts the workbench during application bootstrapping, blocking Angular's app startup until the workbench is ready.
     *   No splash is displayed.
     *
     * @deprecated since version 19.0.0-beta.3. To start the workbench in an app initializer, use Angular's `provideAppInitializer()` function: `provideAppInitializer(() => inject(WorkbenchLauncher).launch())`. Otherwise, no migration is necessary. No replacement. API will be removed in version 21.
     */
    launcher?: 'LAZY' | 'APP_INITIALIZER';

    /**
     * Specifies the component to display in `<wb-workbench>` while the workbench is starting.
     *
     * Note: No splash screen is displayed when using the app initializer strategy.
     *
     * @deprecated since version 19.0.0-beta.3. Property has been moved. Configure the splash in `WorkbenchConfig.splashComponent`. Property will be removed in version 21.
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
   * Provides texts to the SCION Workbench.
   *
   * A text provider is a function that returns the text for a translation key.
   *
   * Texts starting with the percent symbol (`%`) are passed to the text provider for translation, with the percent symbol omitted.
   * Otherwise, the text is returned as is.
   *
   * The SCION Workbench uses the following translation keys for built-in texts:
   * - workbench.clear.tooltip
   * - workbench.close.action
   * - workbench.close_all_tabs.action
   * - workbench.close_other_tabs.action
   * - workbench.close_tab.action
   * - workbench.close_tabs_to_the_left.action
   * - workbench.close_tabs_to_the_right.action
   * - workbench.close.tooltip
   * - workbench.move_tab_down.action
   * - workbench.move_tab_to_new_window.action
   * - workbench.move_tab_to_the_left.action
   * - workbench.move_tab_to_the_right.action
   * - workbench.move_tab_up.action
   * - workbench.ok.action
   * - workbench.page_not_found.message
   * - workbench.page_not_found.title
   * - workbench.page_not_found_developer_hint.message
   * - workbench.show_open_tabs.tooltip
   *
   * The function:
   * - Can call `inject` to get any required dependencies.
   * - Can call `toSignal` to convert an Observable to a Signal.
   *
   * @see WorkbenchTextProviderFn
   */
  public abstract textProvider?: WorkbenchTextProviderFn;

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
 * Each property represents a menu item, allowing customization of visibility, accelerators, and more.
 *
 * Texts can be changed or localized using a {@link WorkbenchTextProviderFn text provider} passed to {@link provideWorkbench} via the workbench config object.
 */
export interface ViewMenuItemsConfig {
  /**
   * Configures the menu item for closing a view tab.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.close_tab.action`
   */
  close?: MenuItemConfig | false;
  /**
   * Configures the menu item for closing other view tabs.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.close_other_tabs.action`
   */
  closeOthers?: MenuItemConfig | false;
  /**
   * Configures the menu item for closing all view tabs.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.close_all_tabs.action`
   */
  closeAll?: MenuItemConfig | false;
  /**
   * Configures the menu item for closing view tabs to the right.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.close_tabs_to_the_right.action`
   */
  closeToTheRight?: MenuItemConfig | false;
  /**
   * Configures the menu item for closing view tabs to the left.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.close_tabs_to_the_left.action`
   */
  closeToTheLeft?: MenuItemConfig | false;
  /**
   * Configures the menu item for moving a view up.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.move_tab_up.action`
   */
  moveUp?: MenuItemConfig | false;
  /**
   * Configures the menu item for moving a view to the right.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.move_tab_to_the_right.action`
   */
  moveRight?: MenuItemConfig | false;
  /**
   * Configures the menu item for moving a view down.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbenchworkbench.move_tab_down.action`
   */
  moveDown?: MenuItemConfig | false;
  /**
   * Configures the menu item for moving a view to the left.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.move_tab_to_the_left.action`
   */
  moveLeft?: MenuItemConfig | false;
  /**
   * Configures the menu item for moving a view to a new window.
   *
   * Set to `false` to exclude it.
   *
   * The menu item text can be changed or localized using a {@link WorkbenchTextProviderFn}.
   * Translation key: `workbench.move_tab_to_new_window.action`
   */
  moveToNewWindow?: MenuItemConfig | false;
}

/**
 * Configures a built-in menu item.
 */
export interface MenuItemConfig {
  /**
   * @deprecated since version 19.0.0-beta.2. Set to `false` in {@link ViewMenuItemsConfig} to exclude the menu item. API will be removed in version 21.
   */
  visible?: boolean;
  /**
   * Specifies the text of this menu item.
   *
   * Can be a string or a function that returns a string or a {@link Signal}.
   *
   * The function can call `inject` to get any required dependencies, or use `toSignal` to convert an observable to a signal.
   *
   * @deprecated since version 19.0.0-beta.3. Register a text provider to change or localize menu item texts. Register the text provider via workbench configuration passed to the `provideWorkbench` function. API will be removed in version 21.
   */
  text?: string | (() => string | Signal<string>);
  accelerator?: string[];
  group?: string;
  cssClass?: string | string[];
}
