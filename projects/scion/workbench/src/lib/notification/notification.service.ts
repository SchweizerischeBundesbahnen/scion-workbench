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
import { Notification, ɵNotification } from './notification';

/**
 * Displays notifications to the user.
 */
@Injectable()
export class NotificationService {

  private _notify$ = new Subject<ɵNotification>();

  constructor(private _zone: NgZone) {
  }

  /**
   * Pops up a notification.
   */
  public notify(notification: Notification | string): void {
    // Ensure to run in Angular zone to display the notification even if called from outside of the Angular zone, e.g. from error handler
    this._zone.run(() => this.notifyInternal(notification));
  }

  private notifyInternal(notification: Notification | string): void {
    const note = ((): ɵNotification => {
      if (typeof notification === 'string') {
        return new ɵNotification({content: notification});
      }
      else {
        return new ɵNotification(notification);
      }
    })();

    this._notify$.next(note);
  }

  /**
   * Allows to subscribe for notifications.
   * @internal
   */
  public get notify$(): Observable<ɵNotification> {
    return this._notify$;
  }
}
