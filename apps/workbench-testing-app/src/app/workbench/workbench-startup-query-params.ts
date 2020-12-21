/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';

/**
 * Provides access to initial page query params to instrument the workbench startup.
 *
 * We read the query params before starting Angular. Therefore, they must be part of the effective URL and
 * not the hash-based route. Since the app is configured with hash-based routing, Angular discards these
 * query params when initializing the app.
 */
export namespace WorkbenchStartupQueryParams {

  /**
   * Query param to set the workbench launch strategy.
   */
  export const LAUNCHER_QUERY_PARAM = 'launcher';

  /**
   * Query param to set if to run the workbench standalone, or to start it with microfrontend support enabled.
   */
  export const STANDALONE_QUERY_PARAM = 'standalone';

  /**
   * Query param to display an alert dialog during workbench startup to pause the workbench startup until the user confirms the alert.
   */
  export const CONFIRM_STARTUP_QUERY_PARAM = 'confirmStartup';

  /**
   * Reads the query param to set the workbench launching strategy.
   */
  export function launcher(): 'APP_INITIALIZER' | 'LAZY' {
    return new URL(window.location.href).searchParams.get(LAUNCHER_QUERY_PARAM) as 'APP_INITIALIZER' | 'LAZY';
  }

  /**
   * Reads the query param to decide if to run the workbench standalone, or to start it with microfrontend support enabled.
   */
  export function standalone(): boolean {
    return coerceBooleanProperty(new URL(window.location.href).searchParams.get(STANDALONE_QUERY_PARAM));
  }

  /**
   * Reads the query param if to display an alert dialog during workbench startup to pause the workbench startup until the user confirms the alert.
   */
  export function confirmStartup(): boolean {
    return coerceBooleanProperty(new URL(window.location.href).searchParams.get(CONFIRM_STARTUP_QUERY_PARAM));
  }
}

