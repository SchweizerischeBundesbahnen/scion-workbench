/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injector, ViewContainerRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Configures the content and appearance of a notification presented to the user.
 *
 * A notification is a closable message that appears in the upper-right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 *
 * Multiple notifications are stacked vertically. Notifications can be grouped. For each group, only the last notification is
 * displayed at any given time.
 */
export interface NotificationConfig {

  /**
   * Optional title of the notification.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  title?: Translatable;

  /**
   * Content of the notification, can be either a plain text message or a component.
   *
   * Consider using a component when displaying structured content. You can pass data to the component using the
   * {@link componentInput} property or by providing a custom injector in {@link componentConstructOptions.injector}.
   */
  content: Translatable | ComponentType<unknown>;

  /**
   * If using a component as the notification content, optionally instruct Angular how to construct the component.
   * In most cases, construct options need not to be set.
   */
  componentConstructOptions?: {

    /**
     * Sets the injector for the instantiation of the notification component, giving you control over the objects available
     * for injection into the notification component. If not specified, uses the application's root injector.
     *
     * ```ts
     * Injector.create({
     *   parent: ...,
     *   providers: [
     *    {provide: <DiToken>, useValue: <value>}
     *   ],
     * })
     * ```
     */
    injector?: Injector;

    /**
     * Sets the component's attachment point in Angular's logical component tree (not the DOM tree used for rendering), effecting when
     * Angular checks the component for changes during a change detection cycle. If not set, inserts the component at the top level
     * in the component tree.
     */
    viewContainerRef?: ViewContainerRef;
  };

  /**
   * Optional data to pass to the notification component. In the component, you can inject the notification handle {@link Notification} to
   * read input data. Use only in combination with a custom notification component, has no effect otherwise.
   */
  componentInput?: unknown;

  /**
   * Specifies the severity of the notification. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Specifies the timeout after which to close the notification automatically. Defaults to `medium`.
   * Can be either a duration alias, or a number in seconds.
   */
  duration?: 'short' | 'medium' | 'long' | 'infinite' | number;

  /**
   * Specifies the group which this notification belongs to.
   * If specified, the notification will replace any previously displayed notification of the same group.
   */
  group?: string;

  /**
   * Use in combination with {@link group} to reduce the input to be passed to a notification.
   *
   * Note that the reducer function, if specified, is only invoked for notifications that belong to a group.
   * If no reducer is specified, the input of the notification is passed as is.
   *
   * Each time when to display a notification that belongs to a group and if there is already present a
   * notification of that group, the reduce function is called with the input of that present notification
   * and the input of the new notification, allowing for the aggregation of the input values.
   */
  groupInputReduceFn?: (prevInput: any, currInput: any) => any;

  /**
   * Specifies CSS class(es) to add to the notification, e.g., to locate the notification in tests.
   */
  cssClass?: string | string[];
}
