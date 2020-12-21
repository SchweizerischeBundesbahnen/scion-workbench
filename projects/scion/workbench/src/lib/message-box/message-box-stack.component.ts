/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { animate, AnimationMetadata, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageBoxService } from './message-box.service';
import { Action, ɵMessageBox } from './message-box';
import { MessageBoxComponent } from './message-box.component';

@Component({
  selector: 'wb-message-box-stack',
  templateUrl: './message-box-stack.component.html',
  styleUrls: ['./message-box-stack.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('enter', MessageBoxStackComponent.provideEnterAnimation()),
    trigger('leave', MessageBoxStackComponent.provideLeaveAnimation()),
  ],
})
export class MessageBoxStackComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public messageBoxes: ɵMessageBox[] = [];

  constructor(messageBoxService: MessageBoxService, private _cd: ChangeDetectorRef) {
    messageBoxService.open$
      .pipe(takeUntil(this._destroy$))
      .subscribe((messageBox) => {
        this.messageBoxes.push(messageBox);
        this._cd.markForCheck();
      });
  }

  public onClose(index: number, action: Action): void {
    this.messageBoxes.splice(index, 1)
      .map(messageBox => messageBox.close$)
      .forEach(close$ => {
        close$.next(action);
        close$.complete();
      });

    this._cd.markForCheck();
  }

  /**
   * This method is invoked when the user clicks outside the message box.
   */
  public onGlasspaneClick(event: MouseEvent, messageBox: MessageBoxComponent): void {
    event.stopPropagation(); // to not loose focus
    event.stopImmediatePropagation();
    event.preventDefault();
    messageBox.blink();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  /**
   * Returns animation metadata to slide-in a new message-box.
   */
  private static provideEnterAnimation(): AnimationMetadata[] {
    return [
      transition(':enter', [
        style({opacity: 0, bottom: '100%', top: 'unset'}),
        animate('.1s ease-out', style({opacity: 1, bottom: '*'})),
      ]),
    ];
  }

  /**
   * Returns animation metadata to fade-out upon dismiss.
   */
  private static provideLeaveAnimation(): AnimationMetadata[] {
    return [
      transition(':leave', [
        animate('.3s ease-out', style({opacity: 0})),
      ]),
    ];
  }
}
