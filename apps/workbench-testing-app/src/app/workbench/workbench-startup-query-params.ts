/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {LogLevel, PartId} from '@scion/workbench';
import {booleanAttribute} from '@angular/core';

/**
 * Provides query parameters to instrument the startup of the workbench testing app.
 *
 * We read the query params before starting Angular. Therefore, they must be part of the effective URL and
 * not the hash-based route. Since the app is configured with hash-based routing, Angular discards these
 * query params when initializing the app.
 */
export const WorkbenchStartupQueryParams = {

  /**
   * Query param to bootstrap the app with a specific app config.
   *
   * Params can be passed in the form of matrix params: "app-with-guard;forbidden=true"
   *
   * Available configs:
   * - 'app-with-guard'
   * - 'app-with-redirect'
   *
   * See `main.ts`.
   */
  APP_CONFIG_QUERY_PARAM: 'appConfig',

  /**
   * Query param to set the workbench launch strategy.
   */
  LAUNCHER_QUERY_PARAM: 'launcher',

  /**
   * Query param to set if to run the workbench standalone, or to start it with microfrontend support enabled.
   */
  STANDALONE_QUERY_PARAM: 'standalone',

  /**
   * Query param to read provided design tokens.
   */
  DESIGN_TOKENS: 'designTokens',

  /**
   * Query param to display an alert dialog during workbench startup to pause the workbench startup until the user confirms the alert.
   */
  CONFIRM_STARTUP_QUERY_PARAM: 'confirmStartup',

  /**
   * Query param to throttle capability lookups to simulate slow capability retrievals.
   */
  SIMULATE_SLOW_CAPABILITY_LOOKUP: 'simulateSlowCapabilityLookup',

  /**
   * Query param to set the scope for workbench application-modal dialogs.
   */
  DIALOG_MODALITY_SCOPE: 'dialogModalityScope',

  /**
   * Query param to control the identity of the initial part in the main area.
   *
   * The initial part is automatically created by the workbench if the main area has no part, but it has no
   * special meaning to the workbench and can be removed by the user. If not set, a UUID is assigned.
   */
  MAIN_AREA_INITIAL_PART_ID: 'mainAreaInitialPartId',

  /**
   * Query param to control which desktop component to display. Defaults to {@link StartPageComponent}.
   *
   * Available desktops:
   * - 'desktop-page': Displays the 'DesktopPageComponent'.
   * - 'focus-page': Displays {@link FocusTestPageComponent}.
   * - 'layout-page': Displays {@link LayoutPageComponent}.
   */
  DESKTOP: 'desktop',

  /**
   * Query param to control the log level of the SCION Workbench.
   */
  LOG_LEVEL: 'logLevel',

  /**
   * Query param to control whether to preload inactive microfrontend views not defining the `lazy` property.
   */
  PRELOAD_INACTIVE_MICROFRONTEND_VIEWS: 'preloadInactiveMicrofrontendViews',

  /**
   * Reads the query param to bootstrap the app with a specific app config.
   *
   * Params can be passed in the form of matrix params: "app-with-guard;forbidden=true"
   */
  appConfig: (): string | undefined => {
    return new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.APP_CONFIG_QUERY_PARAM) ?? undefined;
  },

  /**
   * Reads the query param to set the workbench launching strategy.
   */
  launcher: (): 'APP_INITIALIZER' | 'LAZY' | undefined => {
    return new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.LAUNCHER_QUERY_PARAM) as 'APP_INITIALIZER' | 'LAZY' | null ?? undefined;
  },

  /**
   * Reads the query param to set the scope for workbench application-modal dialogs.
   */
  dialogModalityScope: (): 'workbench' | 'viewport' | undefined => {
    return new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.DIALOG_MODALITY_SCOPE) as 'workbench' | 'viewport' | null ?? undefined;
  },

  /**
   * Reads the query param to decide if to run the workbench standalone, or to start it with microfrontend support enabled.
   */
  standalone: (): boolean => {
    return booleanAttribute(new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.STANDALONE_QUERY_PARAM));
  },

  /**
   * Reads the query param with design tokens provided to the application.
   */
  designTokens: (): {[name: string]: string} | undefined => {
    const designTokens = new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.DESIGN_TOKENS);
    return designTokens ? JSON.parse(designTokens) as {[name: string]: string} : undefined;
  },

  /**
   * Reads the query param if to display an alert dialog during workbench startup to pause the workbench startup until the user confirms the alert.
   */
  confirmStartup: (): boolean => {
    return booleanAttribute(new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.CONFIRM_STARTUP_QUERY_PARAM));
  },

  /**
   * Reads the query param if to throttle capability lookups to simulate slow capability retrievals.
   */
  simulateSlowCapabilityLookup: (): boolean => {
    return booleanAttribute(new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.SIMULATE_SLOW_CAPABILITY_LOOKUP));
  },

  /**
   * Reads the query param to control the identity of the initial part in the main area.
   */
  mainAreaInitialPartId: (): PartId | undefined => {
    return new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.MAIN_AREA_INITIAL_PART_ID) as PartId | null ?? undefined;
  },

  /**
   * Reads the query param to control the log level of the SCION Workbench.
   */
  logLevel: (): LogLevel | undefined => {
    const logLevel = new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.LOG_LEVEL) as 'debug' | 'info' | 'warn' | 'error' | null ?? undefined;
    return logLevel ? LogLevel[logLevel.toUpperCase() as keyof typeof LogLevel] as LogLevel | undefined : undefined;
  },

  /**
   * Reads the query param to control whether to preload inactive microfrontend views not defining the `lazy` property.
   */
  preloadInactiveMicrofrontendViews: (): true | undefined => {
    return booleanAttribute(new URL(window.location.href).searchParams.get(WorkbenchStartupQueryParams.PRELOAD_INACTIVE_MICROFRONTEND_VIEWS)) || undefined;
  },
} as const;
