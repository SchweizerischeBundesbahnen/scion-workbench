/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { EMPTY, merge, Subject, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ɵNotification } from './ɵnotification';
import { ComponentPortal } from '@angular/cdk/portal';
import { Notification } from './notification';
import { observeInside, subscribeInside } from '@scion/toolkit/operators';

/**
 * A notification is a closable message that appears in the top right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 */
@Component({
  selector: 'wb-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements OnChanges, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _closeTimerChange$ = new Subject<void>();

  public portal: ComponentPortal<any>;

  @Input()
  public notification: ɵNotification;

  @Output()
  public closeNotification = new EventEmitter<void>();

  constructor(private _injector: Injector, private _zone: NgZone) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.installAutoCloseTimer();
    this.portal = this.createPortal(this.notification);
  }

  public onClose(): void {
    this.closeNotification.emit();
  }

  private createPortal(notification: ɵNotification): ComponentPortal<any> {
    const componentConstructOptions = notification.config.componentConstructOptions;
    return new ComponentPortal(notification.component, componentConstructOptions?.viewContainerRef || null, Injector.create({
      parent: notification.config.componentConstructOptions?.injector || this._injector,
      providers: [
        {provide: Notification, useValue: notification},
      ],
    }), componentConstructOptions?.componentFactoryResolver || null);
  }

  /**
   * Installs an auto-close timer if this notification is auto closable.
   * An existing timer, if any, is cancelled.
   */
  private installAutoCloseTimer(): void {
    this._closeTimerChange$.next();

    // Run the timer outside of Angular to allow Protractor tests to continue interacting with the browser.
    // Otherwise, we would urge tests to call 'browser.waitForAngularEnabled(false)', which can lead to flaky
    // tests.
    this.notification.duration$
      .pipe(
        switchMap(duration => {
          switch (duration) {
            case 'short':
              return timer(7000);
            case 'medium':
              return timer(15000);
            case 'long':
              return timer(30000);
            case 'infinite':
              return EMPTY;
            default:
              if (typeof duration === 'number') {
                return timer(duration * 1000);
              }
              return EMPTY;
          }
        }),
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        observeInside(continueFn => this._zone.run(continueFn)),
        takeUntil(merge(this._closeTimerChange$, this._destroy$)),
      )
      .subscribe(() => {
        this.closeNotification.emit();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
