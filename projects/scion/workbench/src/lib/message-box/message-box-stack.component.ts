/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {animate, AnimationMetadata, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {MessageBoxService} from './message-box.service';
import {ɵMessageBox} from './ɵmessage-box';
import {Observable} from 'rxjs';
import {AsyncPipe, NgClass, NgFor} from '@angular/common';
import {MessageBoxComponent} from './message-box.component';
import {MessageBoxCssClassesPipe} from './message-box-css-classes.pipe';
import {ViewDragService} from '../view-dnd/view-drag.service';

/**
 * Stacks message boxes of the current context. Does not include message boxes of parent contexts.
 */
@Component({
  selector: 'wb-message-box-stack',
  templateUrl: './message-box-stack.component.html',
  styleUrls: ['./message-box-stack.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    AsyncPipe,
    MessageBoxComponent,
    MessageBoxCssClassesPipe,
  ],
  animations: [
    trigger('enter', MessageBoxStackComponent.provideEnterAnimation()),
    trigger('leave', MessageBoxStackComponent.provideLeaveAnimation()),
  ],
})
export class MessageBoxStackComponent {

  public messageBoxes$: Observable<ɵMessageBox[]>;

  @HostBinding('class.view-drag')
  public get isViewDragActive(): boolean {
    return this._viewDragService.viewDragData !== null;
  }

  constructor(messageBoxService: MessageBoxService, private _viewDragService: ViewDragService,) {
    this.messageBoxes$ = messageBoxService.messageBoxes$({includeParents: false});
  }

  /**
   * This method is invoked when the user clicks outside the message box.
   */
  public onGlasspaneClick(event: MouseEvent, messageBox: ɵMessageBox): void {
    event.stopPropagation(); // to not lose focus
    event.stopImmediatePropagation();
    event.preventDefault();
    messageBox.blink();
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
