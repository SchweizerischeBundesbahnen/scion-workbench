/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, Injector, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { Notification, WbNotification } from './notification';
import { asyncScheduler, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PortalInjector } from '@angular/cdk/portal';
import { Arrays } from '@scion/toolkit/util';

@Component({
  selector: 'wb-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements AfterViewInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _closeTimerChange$ = new Subject<void>();
  private _notification: WbNotification;

  public text: string;
  public textual: boolean;

  public componentType: any;
  public injector: Injector;

  @Input()
  public set notification(notification: WbNotification) {
    this._notification = notification;
    this._notification.onPropertyChange = (): void => this._cd.markForCheck();
    this.installAutoCloseTimer();

    this.textual = typeof notification.content === 'string';
    if (this.textual) {
      this.text = notification.content as string;
    }
    else {
      const injectionTokens = new WeakMap();
      injectionTokens.set(Notification, notification);
      this.injector = new PortalInjector(this._injector, injectionTokens);
      this.componentType = notification.content;
    }
  }

  @Output()
  public close = new EventEmitter<void>();

  @HostBinding('attr.class')
  public get cssClass(): string {
    return [
      ...Arrays.coerce(this._notification.cssClass),
      this._notification.severity,
      `e2e-severity-${this._notification.severity}`,
      `e2e-duration-${this._notification.duration}`,
    ].join(' ');
  }

  constructor(private _injector: Injector, private _cd: ChangeDetectorRef, private _zone: NgZone) {
  }

  public ngAfterViewInit(): void {
    // Initiate manual change detection cycle because property may change during custom component construction.
    if (this._notification.content) {
      asyncScheduler.schedule(() => this._cd.markForCheck());
    }
  }

  public onClose(): void {
    this.close.emit();
  }

  /**
   * Installs an auto-close timer if this notification is auto closable and,
   * if an existing timer is in place, that timer is cancelled.
   */
  private installAutoCloseTimer(): void {
    this._closeTimerChange$.next();

    if (this._notification.duration === 'infinite') {
      return;
    }

    const autoCloseTimeout = ((): number => {
      switch (this._notification.duration) {
        case 'short':
          return 7000;
        case 'medium':
          return 15000;
        case 'long':
          return 30000;
      }
    })();

    // Run the timer outside of Angular to allow Protractor tests to continue interacting with the browser.
    // Otherwise, tests must set 'browser.waitForAngularEnabled(false)' which can cause flaky tests.
    this._zone.runOutsideAngular(() => {
      timer(autoCloseTimeout)
        .pipe(
          takeUntil(this._destroy$),
          takeUntil(this._closeTimerChange$),
        )
        .subscribe(() => {
          this._zone.run(() => this.onClose());
        });
    });
  }

  public get title(): string {
    return this._notification.title;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
