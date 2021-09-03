/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {animate, AnimationMetadata, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, Component, TrackByFunction} from '@angular/core';

import {NotificationService} from './notification.service';
import {ɵNotification} from './ɵnotification';
import {Observable} from 'rxjs';

/**
 * Displays notifications on the right side.  Multiple notifications are stacked vertically.
 */
@Component({
  selector: 'wb-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('notification-enter-or-leave', NotificationListComponent.provideAnimation())],
})
export class NotificationListComponent {

  public notifications$: Observable<ɵNotification[]>;

  constructor(private _notificationService: NotificationService) {
    this.notifications$ = this._notificationService.notifications$;
  }

  public onNotificationClose(notification: ɵNotification): void {
    this._notificationService.closeNotification(notification);
  }

  public trackByFn: TrackByFunction<ɵNotification> = (index: number, notification: ɵNotification): any => {
    return notification.config.group || notification;
  };

  /**
   * Returns animation metadata to slide-in a new notification, and to fade-out upon dismiss.
   */
  private static provideAnimation(): AnimationMetadata[] {
    return [
      transition(':enter', [
        style({opacity: 0, left: '100%'}),
        animate('.3s ease-out', style({opacity: 1, left: 0})),
      ]),
      transition(':leave', [
        animate('.3s ease-out', style({opacity: 0})),
      ]),
    ];
  }
}
