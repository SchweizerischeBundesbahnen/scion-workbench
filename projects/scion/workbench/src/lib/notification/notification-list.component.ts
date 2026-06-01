/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Signal, ChangeDetectionStrategy} from '@angular/core';
import {WorkbenchNotificationRegistry} from './workbench-notification.registry';
import {ɵWorkbenchNotification} from './ɵworkbench-notification.model';
import {WorkbenchPortalOutletDirective} from '../portal/workbench-portal-outlet.directive';

/**
 * Displays notifications on the right side, stacked vertically.
 */
@Component({
  selector: 'wb-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
  // Required for backward compatibility for zone-based applications to support child components with eager change detection.
  changeDetection: ChangeDetectionStrategy.Eager, // eslint-disable-line @angular-eslint/prefer-on-push-component-change-detection
  imports: [
    WorkbenchPortalOutletDirective,
  ],
})
export class NotificationListComponent {

  protected readonly notifications: Signal<ɵWorkbenchNotification[]> = inject(WorkbenchNotificationRegistry).elements;
}
