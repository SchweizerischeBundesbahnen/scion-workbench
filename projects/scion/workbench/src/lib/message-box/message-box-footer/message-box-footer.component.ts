/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Component, ElementRef, EventEmitter, HostBinding, inject, Input, Output, QueryList, ViewChildren} from '@angular/core';
import {KeyValuePipe} from '@angular/common';
import {observeOn} from 'rxjs/operators';
import {animationFrameScheduler, firstValueFrom} from 'rxjs';
import {fromResize$} from '@scion/toolkit/observable';

@Component({
  selector: 'wb-message-box-footer',
  templateUrl: './message-box-footer.component.html',
  styleUrls: ['./message-box-footer.component.scss'],
  imports: [
    KeyValuePipe,
  ],
})
export class MessageBoxFooterComponent {

  @ViewChildren('action_button')
  private _actionButtons!: QueryList<ElementRef<HTMLElement>>;

  @Input({required: true})
  public actions!: {[key: string]: string};

  @Input({required: true})
  @HostBinding('attr.data-severity')
  public severity!: 'info' | 'warn' | 'error';

  @Output()
  public action = new EventEmitter<string>();

  @Output()
  public preferredSizeChange = new EventEmitter<number>();

  constructor() {
    void this.emitPreferredSize();
  }

  protected insertionSortOrderFn = (): number => 0;

  protected onAction(key: string): void {
    this.action.emit(key);
  }

  protected onArrowKey(index: number, direction: 'left' | 'right'): void {
    const actionButtons = this._actionButtons.toArray();
    const actionButtonCount = actionButtons.length;
    const newIndex = (direction === 'left' ? index - 1 : index + 1);
    actionButtons[((newIndex + actionButtonCount) % actionButtonCount)].nativeElement.focus();
  }

  private async emitPreferredSize(): Promise<void> {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    host.classList.add('calculating-min-width');
    try {
      // Wait for the CSS class to take effect, then wait an animation frame to avoid the error: "ResizeObserver loop completed with undelivered notifications".
      await firstValueFrom(fromResize$(host).pipe(observeOn(animationFrameScheduler)));
      this.preferredSizeChange.emit(host.offsetWidth);
    }
    finally {
      host.classList.remove('calculating-min-width');
    }
  }
}
