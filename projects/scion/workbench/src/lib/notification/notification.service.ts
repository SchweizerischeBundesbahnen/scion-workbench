/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, inject, Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, fromEvent, Observable} from 'rxjs';
import {ɵNotification} from './ɵnotification';
import {NotificationConfig} from './notification.config';
import {DOCUMENT} from '@angular/common';
import {filter, map} from 'rxjs/operators';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {Arrays} from '@scion/toolkit/util';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Allows displaying a notification to the user.
 *
 * A notification is a closable message that appears in the upper-right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 *
 * Multiple notifications are stacked vertically. Notifications can be grouped. For each group, only the last notification is
 * displayed.
 *
 * To display structured content, consider passing a component to {@link NotificationConfig#content} instead of plain text.
 */
@Injectable({providedIn: 'root'})
export class NotificationService {

  private readonly _zone = inject(NgZone);
  private readonly _document = inject(DOCUMENT);
  private readonly _notifications$ = new BehaviorSubject<ɵNotification[]>([]);

  constructor() {
    this.installEscapeHandler();
  }

  /**
   * Presents the user with a notification that is displayed in the upper-right corner based on the given config.
   *
   * To display structured content, consider passing a component to {@link NotificationConfig#content}.
   *
   * ### Usage:
   * ```typescript
   * notificationService.notify({
   *   content: 'Task scheduled for execution.',
   *   severity: 'info',
   *   duration: 'short',
   * });
   * ```
   *
   * @param  notification - Configures the content and appearance of the notification.
   */
  public notify(notification: string | NotificationConfig): void {
    assertNotInReactiveContext(this.notify, 'Call NotificationService.notify() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to display the notification even when called from outside the Angular zone, e.g. from an error handler.
    if (!NgZone.isInAngularZone()) {
      this._zone.run(() => this.notify(notification));
      return;
    }

    const config: NotificationConfig = typeof notification === 'string' ? {content: notification} : notification;
    this.addNotification(config);
  }

  private addNotification(config: NotificationConfig): void {
    const notifications = [...this.notifications];
    const {index, notification} = this.constructNotification(config, notifications);
    notifications.splice(index, 1, notification);
    this._notifications$.next(notifications);
  }

  /**
   * Constructs the notification based on the given config and computes its insertion index.
   */
  private constructNotification(config: NotificationConfig, notifications: ɵNotification[]): {notification: ɵNotification; index: number} {
    config = {...config};

    // Check whether the notification belongs to a group. If so, replace any present notification of that group.
    const group = config.group;
    if (!group) {
      return {
        notification: new ɵNotification(config),
        index: notifications.length,
      };
    }

    // Check whether there is a notification of the same group present.
    const index = notifications.findIndex(it => it.config.group === group);
    if (index === -1) {
      return {
        notification: new ɵNotification(config),
        index: notifications.length,
      };
    }

    // Reduce the notification's input, if specified a reducer.
    if (config.groupInputReduceFn) {
      config.componentInput = config.groupInputReduceFn(notifications[index].input, config.componentInput);
    }

    return {
      notification: new ɵNotification(config),
      index: index,
    };
  }

  private get notifications(): ɵNotification[] {
    return this._notifications$.value;
  }

  /**
   * @internal
   */
  public closeNotification(notification: ɵNotification): void {
    this._notifications$.next(this.notifications.filter(it => it !== notification));
  }

  /**
   * @internal
   */
  public get notifications$(): Observable<ɵNotification[]> {
    return this._notifications$;
  }

  /**
   * Installs a keystroke listener to close the last notification when the user presses the escape keystroke.
   */
  private installEscapeHandler(): void {
    fromEvent<KeyboardEvent>(this._document, 'keydown')
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        filter((event: KeyboardEvent) => event.key === 'Escape'),
        map(() => Arrays.last(this.notifications)),
        filter((notification): notification is ɵNotification => !!notification),
        observeIn(fn => this._zone.run(fn)),
        takeUntilDestroyed(),
      )
      .subscribe(lastNotification => {
        this.closeNotification(lastNotification);
      });
  }
}
