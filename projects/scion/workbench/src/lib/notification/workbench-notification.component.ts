/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DOCUMENT, effect, ElementRef, inject, NgZone, Provider, signal, untracked, viewChild} from '@angular/core';
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
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {contributeMenu, SciToolbarComponent} from '@scion/sci-components/menu';

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
    SciToolbarComponent,
  ],
  hostDirectives: [
    GlassPaneDirective,
  ],
  providers: [
    configureNotificationGlassPane(),
  ],
  host: {
    '[attr.data-notificationid]': 'notification.id',
    '[attr.data-severity]': 'notification.severity()',
    '[style.min-height]': 'notification.size.minHeight()',
    '[style.height]': 'notification.size.height()',
    '[style.max-height]': 'notification.size.maxHeight()',
    '[style.--ɵslot-anchor]': '`--${slotAnchorName}`',
    '[attr.tabindex]': '-1',
    '[class]': 'notification.cssClass()',
    '(mouseenter)': 'hover.set(true)',
    '(mouseleave)': 'hover.set(false)',
    '(auxclick)': 'onAuxClick($event)',
    '(mousedown)': 'onMouseDown($event)',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class WorkbenchNotificationComponent {

  protected readonly notification = inject(ɵWorkbenchNotification);
  protected readonly hover = signal(false);
  protected readonly slotAnchorName = this.notification.id.replace('.', '_'); // Anchor must not contain a dot.

  public readonly notificationSlotBounds = viewChild('slot_bounds', {read: ElementRef<HTMLElement>});

  constructor() {
    this.installAutoCloseTimer();
    this.closeOnEscapeIfOnTop();

    trackFocus(inject(ElementRef).nativeElement as HTMLElement, this.notification);

    contributeMenu('toolbar:workbench.notification', toolbar => toolbar
      .addMenu({icon: 'more_vert', visualMenuHint: false, name: 'menu:additions'}, menu => menu),
    )

  }

  protected onClose(): void {
    this.notification.close();
  }

  protected onEscape(event: Event): void {
    if (this.notification.focused()) {
      event.stopPropagation(); // stop propagation to prevent closing the most recently displayed notification
      this.notification.close();
    }
  }

  protected onAuxClick(event: MouseEvent): void {
    if (event.button === 1) { // primary aux button
      event.preventDefault(); // prevent user-agent default action
      this.notification.close();
    }
  }

  protected onMouseDown(event: MouseEvent): void {
    if (event.button === 1) { // primary aux button
      event.preventDefault(); // prevent middle-click scrolling; necessary for aux click to work
    }
  }

  /**
   * Closes this notification when pressing escape if it is the most recently displayed notification.
   */
  private closeOnEscapeIfOnTop(): void {
    const zone = inject(NgZone);
    const document = inject(DOCUMENT);

    effect(onCleanup => {
      if (!this.notification.top()) {
        return;
      }

      const subscription = fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(
          subscribeIn(fn => zone.runOutsideAngular(fn)),
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          observeIn(fn => zone.run(fn)),
        )
        .subscribe(() => this.notification.close());
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /**
   * Installs a timer to close the notification.
   */
  private installAutoCloseTimer(): void {
    effect(onCleanup => {
      const duration = this.notification.duration();
      const focus = this.notification.focused();
      const blockedBy = this.notification.blockedBy();
      const hover = this.hover();

      if (hover || focus || blockedBy) {
        return;
      }

      untracked(() => {
        const subscription = fromDuration$(duration).subscribe(() => this.notification.close());
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
 * Blocks this notification when dialog(s) overlay it.
 */
function configureNotificationGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useFactory: () => inject(ɵWorkbenchNotification),
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: (): GlassPaneOptions => ({attributes: {'data-notificationid': inject(ɵWorkbenchNotification).id}}),
    },
  ];
}
