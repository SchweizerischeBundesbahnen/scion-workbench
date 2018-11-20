/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageBus } from './message-bus-service';
import { Service } from './metadata';
import { Platform } from './platform';
import { Params } from '@angular/router';
import { HostMessage, PlatformCapabilityTypes, PopupHostMessageTypes, PopupIntentMessage, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Displays a popup to the user.
 */
export class PopupService implements Service {

  /**
   * Opens a popup relative to the specified anchor with content as provided by a respective capability provider.
   *
   * @returns a promise that:
   *          - resolves to the result if closed with a result
   *          - resolves to `undefined` if closed without a result
   */
  public open<T>(popup: Popup, qualifier: Qualifier): Promise<T> {
    const {top, right, bottom, left, width, height} = popup.anchor.getBoundingClientRect();

    const popupIntentMessage: PopupIntentMessage = {
      type: PlatformCapabilityTypes.Popup,
      qualifier: qualifier,
      payload: {
        queryParams: popup.queryParams,
        matrixParams: popup.matrixParams,
        anchor: {top, right, bottom, left, width, height},
        position: popup.position,
        closeStrategy: popup.closeStrategy,
      },
    };

    return Platform.getService(MessageBus).requestReply({channel: 'intent', message: popupIntentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message); // replyEnvelope is 'undefined' on shutdown
  }

  /**
   * Closes the popup which is currently showing this application.
   */
  public close(result?: any): void {
    Platform.getService(MessageBus).postMessage({
      channel: 'host',
      message: {
        type: PopupHostMessageTypes.Close,
        payload: result,
      } as HostMessage,
    });
  }

  public onDestroy(): void {
    // noop
  }
}

/**
 * Specifies the location and optional queryParams and matrixParams of the popup to show.
 */
export interface Popup {
  /**
   * Specifies optional query parameters to open the popup.
   */
  queryParams?: Params;
  /**
   * Specifies optional matrix parameters to open the popup.
   *
   * Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters,
   * but do not affect route resolution.
   */
  matrixParams?: Params;
  /**
   * Specifies the {Element} where to attach the popup.
   */
  anchor: Element;
  /**
   * Specifies in which region of the popup anchor to show the popup (unless not enough space).
   */
  position?: 'east' | 'west' | 'north' | 'south';
  /**
   * Controls when to close the popup. By default, the popup closes on focus lost and escape keystroke.
   */
  closeStrategy?: {
    /**
     * Specifies if to close the popup on focus lost, which is `true` by default.
     */
    onFocusLost?: boolean;
    /**
     * Specifies if to close the popup on escape keystroke, which is `true` by default.
     */
    onEscape?: boolean;
    /**
     * Specifies if to close the popup on workbench view grid change, which is `true` by default.
     */
    onGridLayoutChange?: boolean;
  };
}
