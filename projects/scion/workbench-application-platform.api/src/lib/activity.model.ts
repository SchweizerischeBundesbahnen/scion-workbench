/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability, PlatformCapabilityTypes, Qualifier } from './core.model';

/**
 * Capability to show an application page as a workbench activity.
 */
export interface ActivityCapability extends Capability {

  type: PlatformCapabilityTypes.Activity;

  properties: {
    /**
     * Specifies the title of the activity.
     */
    title: string;

    /**
     * Specifies CSS class(es) added to the activity item and activity panel, e.g. used for e2e testing.
     */
    cssClass: string | string[];

    /**
     * Specifies the text for the activity item.
     *
     * You can use it in combination with `itemCssClass`, e.g. to render an icon glyph by using its textual name.
     */
    itemText: string;

    /**
     * Specifies CSS class(es) added to the activity item, e.g. used for e2e testing or to set an icon font class.
     */
    itemCssClass: string | string[];

    /**
     * Specifies where to insert this activity in the list of activities.
     */
    position: number;

    /**
     * Path of the application page to show as a workbench activity.
     *
     * The path is relative to the base URL as specified in the application manifest.
     */
    path: string;

    /**
     * Specifies optional query parameters given to the activity.
     */
    queryParams?: {
      [key: string]: string;
    };

    /**
     * Specifies optional matrix parameters given to the activity.
     *
     * Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters,
     * but do not affect route resolution.
     */
    matrixParams?: {
      [key: string]: any;
    };
  };
}

/**
 * Represents message types used for communication between the activity application outlet and the application.
 */
export enum ActivityHostMessageTypes {
  /**
   * Notifies when the activity is activated or deactivated.
   *
   * direction:  outlet => application
   * request:    boolean
   * reply:      -
   */
  Active = 'activity-active',
  /**
   * Reads properties of the activity.
   *
   * direction:  application => outlet
   * request:    void
   * reply:      ActivityProperties
   */
  PropertiesRead = 'activity-properties-read',
  /**
   * Instructs the platform to set given activity properties.
   *
   * direction:  application => outlet
   * request:    ActivityProperties
   * reply:      -
   */
  PropertiesWrite = 'activity-properties-write',
  /**
   * Instructs the platform to add given activity action.
   *
   * direction:  application => outlet
   * request:    ActivityAction
   * reply:      -
   */
  ActionAdd = 'activity-action-add',
  /**
   * Instructs the platform to remove given activity action.
   *
   * direction:  application => outlet
   * request:    string (action id)
   * reply:      -
   */
  ActionRemove = 'activity-action-remove',
}

/**
 * Properties of an activity.
 */
export interface ActivityProperties {
  /**
   * Specifies the title of the activity.
   */
  title?: string;

  /**
   * Specifies CSS class(es) added to the activity item and activity panel, e.g. used for e2e testing.
   */
  cssClass?: string | string[];

  /**
   * Specifies the text for the activity item.
   *
   * You can use it in combination with `itemCssClass`, e.g. to render an icon glyph by using its textual name.
   */
  itemText?: string;

  /**
   * Specifies CSS class(es) added to the activity item, e.g. used for e2e testing or to set an icon font class.
   */
  itemCssClass?: string | string[];

  /**
   * Specifies the number of pixels added to the activity panel width if this is the active activity.
   */
  panelWidthDelta?: number;
}

/**
 * Represents an action associated with an activity.
 */
export interface ActivityAction {
  /**
   * The name of this action.
   */
  type: string;
  /**
   * Optional action specific properties.
   */
  properties?: {
    [key: string]: any;
  };
  /**
   * Metadata about this action (read-only, exclusively managed by the platform).
   */
  metadata?: {
    /**
     * Unique identifier of this action.
     */
    id?: string;
    /**
     * Symbolic name of the application adding this action.
     */
    symbolicAppName?: string;
  };
}

/**
 * Types for built in activity actions.
 */
export enum PlatformActivityActionTypes {
  /**
   * Action button to open a view.
   */
  ViewOpen = 'view-open',
  /**
   * Action button to open a popup.
   */
  PopupOpen = 'popup-open',
  /**
   * Action button to open an URL in a separate browser tab.
   */
  UrlOpen = 'url-open',
}

/**
 * Shows an activity button to open a view.
 */
export interface ViewOpenActivityAction extends ActivityAction {

  type: PlatformActivityActionTypes.ViewOpen;

  properties: {
    /**
     * Qualifies the view to open.
     */
    qualifier: Qualifier;
    /**
     * Specifies the label of the button.
     */
    label?: string;
    /**
     * Specifies the title of the button.
     */
    title?: string;
    /**
     * Specifies the CSS class(es) set to the button.
     */
    cssClass?: string | string[];
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
     */
    activateIfPresent?: boolean;
    /**
     * Closes the view if present. Has no effect if no view is present which matches the qualifier.
     */
    closeIfPresent?: boolean;
  };
}

/**
 * Shows an activity button to open a popup.
 */
export interface PopupOpenActivityAction extends ActivityAction {

  type: PlatformActivityActionTypes.PopupOpen;

  properties: {
    /**
     * Qualifies the popup to open.
     */
    qualifier: Qualifier;
    /**
     * Specifies the label of the button.
     */
    label?: string;
    /**
     * Specifies the title of the button.
     */
    title?: string;
    /**
     * Specifies the CSS class(es) set to the button.
     */
    cssClass?: string | string[];
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

/**
 * Shows an activity button to open an URL in a separate browser tab.
 */
export interface UrlOpenActivityAction extends ActivityAction {

  type: PlatformActivityActionTypes.UrlOpen;

  properties: {
    /**
     * Specifies the label of the button.
     */
    label?: string;
    /**
     * Specifies the title of the button.
     */
    title?: string;
    /**
     * Specifies the CSS class(es) set to the button.
     */
    cssClass?: string | string[];
    /**
     * Specifies the URL to open when the button is clicked.
     */
    url: string;
  };
}
