/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injector, Provider} from '@angular/core';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Controls the appearance and behavior of a notification.
 */
export interface WorkbenchNotificationOptions {

  /**
   * Specifies the title of the notification.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  title?: Translatable;

  /**
   * Specifies the severity of the notification. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Controls how long to display the notification.
   *
   * Can be a duration alias, or milliseconds.
   */
  duration?: 'short' | 'medium' | 'long' | 'infinite' | number;

  /**
   * Specifies the group to which the notification belongs. Only the most recent notification within a group is displayed.
   */
  group?: string;

  /**
   * Enables aggregation of input values of notifications of the same group.
   *
   * Use with {@link group} to combine inputs of notifications of the same group.
   *
   * The reducer is invoked with inputs of the previous notification, if still displaying, and inputs of the new notification.
   * The returned input is passed to the new notification.
   */
  groupInputReduceFn?: (prevInput: {[name: string]: unknown}, currInput: {[name: string]: unknown}) => {[name: string]: unknown};

  /**
   * Specifies data to pass to the notification component. Inputs are available as input properties in the notification component.
   *
   * Has no effect if opening a plain text notification.
   *
   * @example - Reading inputs in the component
   * ```ts
   * public someInput = input.required<string>();
   * ```
   */
  inputs?: {[name: string]: unknown};

  /**
   * Specifies the injector for the instantiation of the notification, giving control over the objects available
   * for injection in the notification component. Defaults to the application's root injector.
   *
   * @example - Creating an injector with a DI token
   *
   * ```ts
   * Injector.create({
   *   parent: ...,
   *   providers: [
   *    {provide: <TOKEN>, useValue: <VALUE>}
   *   ],
   * })
   * ```
   */
  injector?: Injector;

  /**
   * Specifies providers available for injection in the notification component.
   *
   * Providers can inject {@link WorkbenchNotification} to interact with the notification.
   */
  providers?: Provider[];

  /**
   * Specifies CSS class(es) to add to the notification, e.g., to locate the notification in tests.
   */
  cssClass?: string | string[];
}
