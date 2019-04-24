/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Service } from './metadata';
import { MessageBus } from './message-bus.service';
import { Platform } from './platform';
import { PlatformCapabilityTypes, Qualifier, ViewIntentMessage } from '@scion/workbench-application-platform.api';

/**
 * Provides workbench view navigation capabilities.
 */
export class RouterService implements Service {

  /**
   * Navigates based on the provided view qualifier.
   *
   * To open views of other applications, ensure to have listed respective intents in the application manifest.
   * To close present views matching the qualifier, set `closeIfPresent` in navigational extras.
   */
  public navigate(command: ViewNavigateCommand): void {
    const viewIntentMessage: ViewIntentMessage = {
      type: PlatformCapabilityTypes.View,
      qualifier: command.qualifier,
      payload: {
        queryParams: command.queryParams,
        matrixParams: command.matrixParams,
        activateIfPresent: command.activateIfPresent,
        closeIfPresent: command.closeIfPresent,
        target: command.target,
      },
    };

    Platform.getService(MessageBus).postMessage({channel: 'intent', message: viewIntentMessage});
  }

  public onDestroy(): void {
    // noop
  }
}

/**
 * Represents the view navigation instruction.
 */
export interface ViewNavigateCommand {
  /**
   * Qualifies the view to open or close.
   */
  qualifier: Qualifier;
  /**
   * Specifies optional query parameters to open the view.
   */
  queryParams?: {
    [key: string]: string;
  };
  /**
   * Specifies optional matrix parameters to open the view.
   *
   * Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters,
   * but do not affect route resolution.
   */
  matrixParams?: {
    [key: string]: any;
  };
  /**
   * Activates the view if it is already present.
   * If not present, the view is opened according to the specified 'target' strategy.
   */
  activateIfPresent?: boolean;
  /**
   * Closes the view if present. Has no effect if no view is present which matches the qualifier.
   */
  closeIfPresent?: boolean;
  /**
   * Controls where to open the view.
   *
   * 'blank': opens the view as a new workbench view (which is by default)
   * 'self':  opens the view in the current workbench view
   */
  target?: 'blank' | 'self';
}
