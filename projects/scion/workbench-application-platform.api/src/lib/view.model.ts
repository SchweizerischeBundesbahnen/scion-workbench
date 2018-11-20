/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability, IntentMessage, PlatformCapabilityTypes } from './core.model';

/**
 * Capability to show an application page as a workbench view.
 */
export interface ViewCapability extends Capability {

  type: PlatformCapabilityTypes.View;

  properties: {
    /**
     * Specifies the path of the application page to open when this capability is invoked.
     *
     * The path is relative to the base URL as specified in the application manifest.
     * Qualifier keys can be used as path variables.
     *
     * Example path: 'persons/:id'
     */
    path: string;

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
     * Specifies the title to be displayed in the view tab.
     */
    title: string;

    /**
     *  Specifies the sub title to be displayed in the view tab.
     */
    heading?: string;

    /**
     * Specifies if a close button should be displayed in the view tab.
     */
    closable?: boolean;

    /**
     * Specifies CSS class(es) added to the <wb-view-tab> and <wb-view> elements, e.g. used for e2e testing.
     */
    cssClass?: string | string[];

    /**
     * If specified, an activity item is added to the activity panel for this view.
     */
    activityItem?: {
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
       * Specifies where to insert this item in the list of activities.
       */
      position: number;
    }
  };
}

/**
 * Represents message types used for communication between the view application outlet and the application.
 */
export enum ViewHostMessageTypes {
  /**
   * Notifies when the view is activated or deactivated.
   *
   * direction:  outlet => application
   * request:    boolean
   * reply:      -
   */
  Active = 'view-active',
  /**
   * Notifies when a view is about to be destroyed to prevent destruction, but only if property `useDestroyNotifier` is set.
   *
   * direction:  outlet => application
   * request:    void
   * reply:      boolean (`true` to continue destruction, `false` to prevent destruction)
   */
  BeforeDestroy = 'view-before-destroy',
  /**
   * Instructs the platform to close the view.
   *
   * direction:  application => outlet
   * request:    void
   * reply:      -
   */
  Close = 'view-close',
  /**
   * Reads properties of the activity.
   *
   * direction:  application => outlet
   * request:    void
   * reply:      ViewProperties
   */
  PropertiesRead = 'view-properties-read',
  /**
   * Instructs the platform to set given view properties.
   *
   * direction:  application => outlet
   * request:    ViewProperties
   * reply:      -
   */
  PropertiesWrite = 'view-properties-write',
}

/**
 * Properties of a view.
 */
export interface ViewProperties {
  /**
   * Specifies the title to be displayed in the view tab.
   */
  title?: string;
  /**
   * Specifies the sub title to be displayed in the view tab.
   */
  heading?: string;
  /**
   * Specifies if the content of the current view is dirty.
   * If dirty, a dirty marker is displayed in the view tab.
   */
  dirty?: boolean;
  /**
   * Specifies if a close button should be displayed in the view tab.
   */
  closable?: boolean;
  /**
   * Specifies if this application uses a notifier function to intercept view destruction.
   */
  useDestroyNotifier?: boolean;
}

/**
 * Intent message to navigate to a view.
 */
export interface ViewIntentMessage extends IntentMessage {

  type: PlatformCapabilityTypes.View;

  payload: {
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
  };
}
