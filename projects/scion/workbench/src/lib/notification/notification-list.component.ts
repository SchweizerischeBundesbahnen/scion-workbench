/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { animate, AnimationMetadata, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, TrackByFunction } from '@angular/core';

import { Notification, WbNotification } from './notification';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NotificationService } from './notification.service';

@Component({
  selector: 'wb-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('notification-enter-or-leave', NotificationListComponent.provideAnimation())],
})
export class NotificationListComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public notifications: WbNotification[] = [];

  constructor(notificationService: NotificationService, private _cd: ChangeDetectorRef) {
    notificationService.notify$
      .pipe(takeUntil(this._destroy$))
      .subscribe((notification) => this.onNotification(notification));
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.notifications.length && this.onNotificationClose(this.notifications.length - 1);
  }

  /**
   * Invoked upon the receipt of a new notification.
   */
  private onNotification(notification: WbNotification): void {
    // Find potential notification which belongs to the same group.
    const index = notification.group && this.notifications.findIndex(it => it.group === notification.group);
    if (index >= 0) {
      notification.input = notification.groupInputReduceFn(this.notifications[index].input, notification.input);
      this.notifications[index] = notification;
    } else {
      this.notifications.push(notification);
    }
    this._cd.markForCheck();
  }

  public onNotificationClose(index: number): void {
    this.notifications.splice(index, 1);
    this._cd.markForCheck();
  }

  public trackByFn: TrackByFunction<Notification> = (index: number, notification: WbNotification): any => {
    return notification.group || notification;
  };

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  /**
   * Returns animation metadata to slide-in a new notification, and to fade-out upon dismiss.
   */
  private static provideAnimation(): AnimationMetadata[] {
    return [
      transition(':enter', [
        style({opacity: 0, left: '100%'}),
        animate('.3s ease-out', style({opacity: 1, left: 0}))
      ]),
      transition(':leave', [
        animate('.3s ease-out', style({opacity: 0}))
      ])
    ];
  }
}
