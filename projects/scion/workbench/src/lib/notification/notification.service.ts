/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Notification, WbNotification } from './notification';

/**
 * Displays notifications to the user.
 */
@Injectable()
export class NotificationService {

  private _notify$ = new Subject<WbNotification>();

  constructor(private _zone: NgZone) {
  }

  /**
   * Pops up a notification.
   */
  public notify(notification: Notification | string): void {
    // Ensure to run in Angular zone to display the notification even if called from outside of the Angular zone, e.g. from error handler
    this._zone.run(() => this.notifyInternal(notification));
  }

  public notifyInternal(notification: Notification | string): void {
    const note = ((): WbNotification => {
      if (typeof notification === 'string') {
        return new WbNotification({content: notification});
      }
      else {
        return new WbNotification(notification);
      }
    })();

    this._notify$.next(note);
  }

  /**
   * Allows to subscribe for notifications.
   */
  public get notify$(): Observable<WbNotification> {
    return this._notify$.asObservable();
  }
}
