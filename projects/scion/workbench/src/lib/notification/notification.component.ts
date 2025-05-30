/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, HostListener, inject, Injector, input, output, untracked} from '@angular/core';
import {EMPTY, OperatorFunction, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ɵNotification} from './ɵnotification';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {Notification} from './notification';
import {AsyncPipe} from '@angular/common';
import {CoerceObservablePipe} from '../common/coerce-observable.pipe';
import {TextPipe} from '../text/text.pipe';
import {IconComponent} from '../icon/icon.component';

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
    CdkPortalOutlet,
    CoerceObservablePipe,
    TextPipe,
    IconComponent,
  ],
})
export class NotificationComponent {

  public readonly notification = input.required<ɵNotification>();
  public readonly closeNotification = output<void>();

  private readonly _injector = inject(Injector);
  private readonly _cd = inject(ChangeDetectorRef);

  protected portal: ComponentPortal<unknown> | undefined;

  constructor() {
    this.createPortal();
    this.installAutoCloseTimer();
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

  /**
   * Creates the portal displaying the notification.
   */
  private createPortal(): void {
    effect(() => {
      const notification = this.notification();

      untracked(() => {
        const componentConstructOptions = notification.config.componentConstructOptions;
        this.portal = new ComponentPortal(notification.component, componentConstructOptions?.viewContainerRef ?? null, Injector.create({
          parent: notification.config.componentConstructOptions?.injector ?? this._injector,
          providers: [
            {provide: Notification, useValue: notification},
          ],
        }));

        // Mark for check to support setting notification properties (e.g., severity, title) in the constructor of the notification component.
        this._cd.markForCheck();
      });
    });
  }

  /**
   * Installs a timer to close the notification.
   */
  private installAutoCloseTimer(): void {
    effect(onCleanup => {
      const notification = this.notification();

      untracked(() => {
        const subscription = notification.duration$
          .pipe(delayDuration())
          .subscribe(() => this.closeNotification.emit());
        onCleanup(() => subscription.unsubscribe());
      });
    });

    function delayDuration(): OperatorFunction<string | number, unknown> {
      return switchMap(duration => {
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
      });
    }
  }
}

/**
 * Indicates that the auxilary mouse button is pressed (usually the mouse wheel button or middle button).
 */
const AUXILARY_MOUSE_BUTTON = 4;
