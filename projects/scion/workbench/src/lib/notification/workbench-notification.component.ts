/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, ElementRef, inject, Injector, input, runInInjectionContext, signal, untracked, viewChild} from '@angular/core';
import {NEVER, Observable, timer} from 'rxjs';
import {NgComponentOutlet} from '@angular/common';
import {TextPipe} from '../text/text.pipe';
import {IconComponent} from '../icon/icon.component';
import {ɵWorkbenchNotification} from './ɵworkbench-notification.model';
import {RemoveLegacyInputPipe} from './remove-legacy-input.pipe';
import {trackFocus} from '../focus/workbench-focus-tracker.service';
import {SciViewportComponent} from '@scion/components/viewport';

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
    SciViewportComponent,
  ],
  host: {
    '[attr.data-notificationid]': 'notification().id',
    '[attr.data-severity]': 'notification().severity()',
    '(mouseenter)': 'hover.set(true)',
    '(mouseleave)': 'hover.set(false)',
    '(mousedown)': 'onMousedown($event)',
    '[style.--ɵnotification-min-height]': 'notification().size.minHeight()',
    '[style.--ɵnotification-height]': 'notification().size.height()',
    '[style.--ɵnotification-max-height]': 'notification().size.maxHeight()',
    '[class]': 'notification().cssClass()',
  },
})
export class WorkbenchNotificationComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _injector = inject(Injector);
  private readonly _notificationElement = viewChild.required<ElementRef<HTMLElement>>('notification_element');

  public readonly notification = input.required<ɵWorkbenchNotification>();

  protected readonly hover = signal(false);

  constructor() {
    this.installAutoCloseTimer();
    this.installFocusTracker();
  }

  protected onMousedown(event: MouseEvent): void {
    if (event.buttons === AUXILARY_MOUSE_BUTTON) {
      this.notification().close();
    }
    else {
      this._notificationElement().nativeElement.focus();
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
      const notification = this.notification();
      const duration = notification.duration();
      const focus = notification.focused();
      const hover = this.hover();

      if (hover || focus) {
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

  private installFocusTracker(): void {
    effect(onCleanup => {
      const notification = this.notification();

      untracked(() => {
        const tracker = runInInjectionContext(this._injector, () => trackFocus(this._host, notification));
        onCleanup(() => tracker.destroy());
      });
    });
  }
}

/**
 * Indicates that the auxilary mouse button is pressed (usually the mouse wheel button or middle button).
 */
const AUXILARY_MOUSE_BUTTON = 4;
