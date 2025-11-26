/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Represents a handle that a notification component can inject to interact with the notification, for example,
 * to read input data or to configure the notification.
 *
 * A notification is a closable message that appears in the upper-right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 *
 * @deprecated since version 21.0.0-beta.1. Replaced by `WorkbenchNotification`. Marked for removal in version 22.
 */
export abstract class Notification<T = any> {

  /**
   * Input data as passed by the notification opener, or `undefined` if not passed.
   */
  public readonly input: T | undefined;

  /**
   * Sets the title of the notification.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract setTitle(title: Translatable | undefined): void;

  /**
   * Sets the severity of the notification.
   */
  public abstract setSeverity(severity: 'info' | 'warn' | 'error'): void;

  /**
   * Sets the timeout upon which to close the notification automatically.
   * Can be either a duration alias, or a number in seconds.
   */
  public abstract setDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | number): void;

  /**
   * Specifies CSS class(es) to add to the notification, e.g., to locate the notification in tests.
   */
  public abstract setCssClass(cssClass: string | string[]): void;

  /**
   * Closes the notification.
   */
  public abstract close(): void;
}
