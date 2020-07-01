/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core';

import { MessageBus } from '@scion/workbench-application.core';

/**
 * Configuration for the Workbench Application.
 */
export abstract class WorkbenchApplicationConfig {

  /**
   * Specifies the message bus implementation used for communication with workbench application platform.
   *
   * If not set, communication is based on `postMessage` and `onmessage` to safely communicate cross-origin with the window parent.
   *
   * @see DefaultMessageBus
   */
  abstract messageBus?: Type<MessageBus>;
  /**
   * Controls focus handling.
   */
  abstract focus?: {
    /**
     * Specifies if to create a focus-trapping region around this application, meaning, that when inside the application,
     * pressing tab or shift+tab should cycle the focus within the application only.
     *
     * By default, this flag is active.
     */
    trapFocus?: boolean;

    /**
     * Specifies if to restore the focus to the last focused element (if any) when this application is activated.
     *
     * By default, this flag is active.
     */
    restoreFocusOnActivate?: boolean;

    /**
     * Specifies if to focus the first focusable element when the application loads. By default, this flag is active.
     *
     * Alternatively, you can use the `autofocus` HTML attribute to make an input take focus when the form is presented.
     */
    autofocus?: boolean;
  };
}
