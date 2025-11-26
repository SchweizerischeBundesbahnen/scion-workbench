/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, input, signal, untracked} from '@angular/core';
import {NEVER, Observable, timer} from 'rxjs';
import {NgComponentOutlet} from '@angular/common';
import {TextPipe} from '../text/text.pipe';
import {IconComponent} from '../icon/icon.component';
import {ɵWorkbenchNotification} from './ɵworkbench-notification';
import {RemoveLegacyInputPipe} from './remove-legacy-input.pipe';

/**
 * Renders the content of a workbench notification.
 */
@Component({
  selector: 'wb-notification',
  templateUrl: './workbench-notification.component.html',
  styleUrl: './workbench-notification.component.scss',
  imports: [
    TextPipe,
    IconComponent,
    NgComponentOutlet,
    RemoveLegacyInputPipe,
  ],
  host: {
    '[attr.data-notificationid]': 'notification().id',
    '[attr.data-severity]': 'notification().severity()',
    '(mouseenter)': 'hover.set(true)',
    '(mouseleave)': 'hover.set(false)',
    '(mousedown)': 'onMousedown($event)',
    '[class]': 'notification().cssClass()',
  },
})
export class WorkbenchNotificationComponent {

  public readonly notification = input.required<ɵWorkbenchNotification>();

  protected readonly hover = signal(false);

  constructor() {
    this.installAutoCloseTimer();
  }

  protected onMousedown(event: MouseEvent): void {
    if (event.buttons === AUXILARY_MOUSE_BUTTON) {
      this.notification().close();
    }
  }

  protected onClose(): void {
    this.notification().close();
  }

  /**
   * Installs a timer to close the notification.
   */
  private installAutoCloseTimer(): void {
    effect(onCleanup => {
      const duration = this.notification().duration();
      const hover = this.hover();
      if (hover) {
        return;
      }

      untracked(() => {
        const subscription = fromDuration$(duration).subscribe(() => this.notification().close());
        onCleanup(() => subscription.unsubscribe());
      });
    });

    function fromDuration$(duration: 'short' | 'medium' | 'long' | 'infinite' | number): Observable<unknown> {
      switch (duration) {
        case 'short':
          return timer(7000);
        case 'medium':
          return timer(15000);
        case 'long':
          return timer(30000);
        default:
          if (typeof duration === 'number') {
            return timer(duration);
          }
          return NEVER;
      }
    }
  }
}

/**
 * Indicates that the auxilary mouse button is pressed (usually the mouse wheel button or middle button).
 */
const AUXILARY_MOUSE_BUTTON = 4;
