/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
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
import { PlatformCapabilityTypes, Qualifier, ViewIntentMessage, ViewRef } from '@scion/workbench-application-platform.api';

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
        blankInsertionIndex: command.blankInsertionIndex,
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
   * Closes the view(s) that match the qualifier, if any.
   */
  closeIfPresent?: boolean;
  /**
   * Controls where to open the view.
   *
   * 'blank':   opens the view in a new view tab (which is by default)
   * 'self':    opens the view in the current view tab
   * <viewRef>: opens the view in the given view tab
   */
  target?: 'blank' | 'self' | ViewRef;
  /**
   * Specifies the position where to insert the view into the tab bar when using 'blank' view target strategy.
   * If not specified, the view is inserted after the active view. Set the index to 'start' or 'end' for inserting
   * the view at the beginning or at the end.
   */
  blankInsertionIndex?: number | 'start' | 'end' | undefined;
}
