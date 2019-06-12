/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability, IntentMessage, PlatformCapabilityTypes } from './core.model';
import { Params } from '@angular/router';

/**
 * Capability to show an application page in a popup.
 */
export interface PopupCapability extends Capability {

  type: PlatformCapabilityTypes.Popup;

  properties: {
    /**
     * Specifies the path of the application page to open when this capability is invoked.
     *
     * The path is relative to the base URL as specified in the application manifest.
     * Qualifier keys can be used as path variables.
     *
     * Example path: 'person/new'
     */
    path: string;
    /**
     * Specifies optional query parameters to open the popup.
     */
    queryParams?: {
      [key: string]: string;
    };
    /**
     * Specifies optional matrix parameters to open the popup.
     *
     * Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters,
     * but do not affect route resolution.
     */
    matrixParams?: {
      [key: string]: any;
    };
    /**
     * Specifies the height of the popup in the unit as specified.
     */
    height?: string;
    /**
     * Specifies the width of the popup in the unit as specified.
     */
    width?: string;
    /**
     * Specifies CSS class(es) added to the popup overlay, e.g. used for e2e testing.
     */
    cssClass?: string | string[];
  };
}

/**
 * Represents message types used for communication between the popup application outlet and the application.
 */
export enum PopupHostMessageTypes {
  /**
   * Instructs the platform to close the popup.
   *
   * direction:  application => outlet
   * request:    void
   * reply:      -
   */
  Close = 'popup-close',
}

/**
 * Intent message to show a popup.
 */
export interface PopupIntentMessage extends IntentMessage {

  type: PlatformCapabilityTypes.Popup;

  payload: {
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
     * Specifies the bounding box of the anchor where to attach the popup.
     */
    anchor: ClientRect;
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
    }
  };
}
