/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DOCUMENT, effect, ElementRef, inject, Injector, input, NgZone, runInInjectionContext, signal, untracked} from '@angular/core';
import {fromEvent, NEVER, Observable, timer} from 'rxjs';
import {NgComponentOutlet} from '@angular/common';
import {TextPipe} from '../text/text.pipe';
import {IconComponent} from '../icon/icon.component';
import {ɵWorkbenchNotification} from './ɵworkbench-notification.model';
import {RemoveLegacyInputPipe} from './remove-legacy-input.pipe';
import {trackFocus} from '../focus/workbench-focus-tracker.service';
import {SciViewportComponent} from '@scion/components/viewport';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {filter} from 'rxjs/operators';

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
    '[style.min-height]': 'notification().size.minHeight()',
    '[style.height]': 'notification().size.height()',
    '[style.max-height]': 'notification().size.maxHeight()',
    '[attr.tabindex]': '-1',
    '[class]': 'notification().cssClass()',
    '(mouseenter)': 'hover.set(true)',
    '(mouseleave)': 'hover.set(false)',
    '(auxclick)': 'onAuxClick($event)',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class WorkbenchNotificationComponent {

  public readonly notification = input.required<ɵWorkbenchNotification>();

  protected readonly hover = signal(false);

  constructor() {
    this.installAutoCloseTimer();
    this.installFocusTracker();
    this.closeOnEscapeIfOnTop();
  }

  protected onClose(): void {
    this.notification().close();
  }

  protected onEscape(event: Event): void {
    if (this.notification().focused()) {
      event.stopPropagation(); // stop propagation to prevent closing the most recently displayed notification
      this.notification().close();
    }
  }

  protected onAuxClick(event: MouseEvent): void {
    if (event.button === 1) { // primary aux button
      event.preventDefault(); // prevent user-agent default action
      this.notification().close();
    }
  }

  /**
   * Closes this notification when pressing escape if it is the most recently displayed notification.
   */
  private closeOnEscapeIfOnTop(): void {
    const zone = inject(NgZone);
    const document = inject(DOCUMENT);

    effect(onCleanup => {
      if (!this.notification().top()) {
        return;
      }

      const subscription = fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(
          subscribeIn(fn => zone.runOutsideAngular(fn)),
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          observeIn(fn => zone.run(fn)),
        )
        .subscribe(() => this.notification().close());
      onCleanup(() => subscription.unsubscribe());
    });
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
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const injector = inject(Injector);

    effect(onCleanup => {
      const notification = this.notification();

      untracked(() => {
        const tracker = runInInjectionContext(injector, () => trackFocus(host, notification));
        onCleanup(() => tracker.destroy());
      });
    });
  }
}
