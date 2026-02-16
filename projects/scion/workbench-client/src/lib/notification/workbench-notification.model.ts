/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NotificationId} from '../workbench.identifiers';
import {Observable} from 'rxjs';
import {WorkbenchNotificationCapability} from './workbench-notification-capability';

/**
 * Handle to interact with a notification opened via {@link WorkbenchNotificationService}.
 *
 * The notification microfrontend can inject this handle to interact with the notification,
 * such as reading parameters or signaling readiness.
 *
 * @category Notification
 * @see WorkbenchNotificationCapability
 * @see WorkbenchNotificationService
 */
export abstract class WorkbenchNotification {

  /**
   * Identity of this notification.
   */
  public abstract readonly id: NotificationId;

  /**
   * Capability of the microfrontend loaded into this notification.
   */
  public abstract readonly capability: WorkbenchNotificationCapability;

  /**
   * Parameters as passed by the notification opener.
   */
  public abstract readonly params: Map<string, unknown>;

  /**
   * Provides information about where the notification was opened.
   */
  public abstract readonly referrer: {

    /**
     * Symbolic name of the application that opened the notification.
     */
    readonly appSymbolicName: string;
  };

  /**
   * Indicates whether this notification has the focus.
   */
  public abstract readonly focused$: Observable<boolean>;

  /**
   * Signals readiness, notifying the workbench that this notification has completed initialization.
   *
   * If `showSplash` is set to `true` on the `notification` capability, the workbench displays a splash until the notification microfrontend signals readiness.
   *
   * @see WorkbenchNotificationCapability.properties.showSplash
   */
  public abstract signalReady(): void;

  /**
   * Closes the notification.
   */
  public abstract close(): void;
}
