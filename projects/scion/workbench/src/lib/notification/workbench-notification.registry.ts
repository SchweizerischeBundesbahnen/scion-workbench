/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, Injectable, Signal} from '@angular/core';
import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';
import {ɵWorkbenchNotification} from './ɵworkbench-notification.model';
import {NotificationId} from '../workbench.identifiers';

/**
 * Registry for {@link WorkbenchNotification} elements.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchNotificationRegistry extends WorkbenchElementRegistry<NotificationId, ɵWorkbenchNotification> {

  /**
   * Gets the most recently opened notification.
   */
  public top: Signal<ɵWorkbenchNotification | undefined>;

  constructor() {
    super({
      nullElementErrorFn: notificationId => Error(`[NullNotificationError] Notification '${notificationId}' not found.`),
      onUnregister: notification => notification.destroy(),
    });

    this.top = computed(() => this.elements().at(-1));
  }
}
