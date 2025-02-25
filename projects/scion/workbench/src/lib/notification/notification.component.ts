/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, HostListener, inject, Injector, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {asapScheduler, EMPTY, Subject, timer} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ɵNotification} from './ɵnotification';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {Notification} from './notification';
import {AsyncPipe} from '@angular/common';
import {CoerceObservablePipe} from '../common/coerce-observable.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * A notification is a closable message that appears in the upper-right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 */
@Component({
  selector: 'wb-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    PortalModule,
    CoerceObservablePipe,
  ],
})
export class NotificationComponent implements OnChanges {

  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cd = inject(ChangeDetectorRef);
  private readonly _closeTimerChange$ = new Subject<void>();

  protected portal: ComponentPortal<unknown> | undefined;

  @Input({required: true})
  public notification!: ɵNotification;

  @Output()
  public closeNotification = new EventEmitter<void>();

  public ngOnChanges(changes: SimpleChanges): void {
    this.installAutoCloseTimer();
    // Create the portal in a microtask for instant synchronization of notification properties with the user interface,
    // for example, if they are set in the constructor of the notification component.
    asapScheduler.schedule(() => {
      this.portal = this.createPortal(this.notification);
      this._cd.detectChanges();
    });
  }

  @HostListener('mousedown', ['$event'])
  protected onMousedown(event: MouseEvent): void {
    if (event.buttons === AUXILARY_MOUSE_BUTTON) {
      this.closeNotification.emit();
    }
  }

  protected onClose(): void {
    this.closeNotification.emit();
  }

  private createPortal(notification: ɵNotification): ComponentPortal<any> {
    const componentConstructOptions = notification.config.componentConstructOptions;
    return new ComponentPortal(notification.component, componentConstructOptions?.viewContainerRef ?? null, Injector.create({
      parent: notification.config.componentConstructOptions?.injector ?? this._injector,
      providers: [
        {provide: Notification, useValue: notification},
      ],
    }));
  }

  /**
   * Installs an auto-close timer if this notification is auto closable.
   * An existing timer, if any, is cancelled.
   */
  private installAutoCloseTimer(): void {
    this._closeTimerChange$.next();

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
        takeUntilDestroyed(this._destroyRef),
        takeUntil(this._closeTimerChange$),
      )
      .subscribe(() => {
        this.closeNotification.emit();
      });
  }
}

/**
 * Indicates that the auxilary mouse button is pressed (usually the mouse wheel button or middle button).
 */
const AUXILARY_MOUSE_BUTTON = 4;
