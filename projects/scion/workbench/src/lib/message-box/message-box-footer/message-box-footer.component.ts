/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Component, ElementRef, inject, input, output, viewChildren} from '@angular/core';
import {KeyValuePipe} from '@angular/common';
import {observeOn} from 'rxjs/operators';
import {animationFrameScheduler, firstValueFrom} from 'rxjs';
import {fromResize$} from '@scion/toolkit/observable';
import {TextPipe} from '../../text/text.pipe';

@Component({
  selector: 'wb-message-box-footer',
  templateUrl: './message-box-footer.component.html',
  styleUrls: ['./message-box-footer.component.scss'],
  imports: [
    KeyValuePipe,
    TextPipe,
  ],
  host: {
    '[attr.data-severity]': 'severity()',
  },
})
export class MessageBoxFooterComponent {

  public readonly actions = input.required<{[key: string]: string}>();
  public readonly severity = input.required<'info' | 'warn' | 'error'>();
  public readonly action = output<string>();
  public readonly preferredSizeChange = output<number>();

  private readonly _actionButtons = viewChildren<ElementRef<HTMLElement>>('action_button');

  constructor() {
    void this.emitPreferredSize();
  }

  protected insertionSortOrderFn = (): number => 0;

  protected onAction(key: string): void {
    this.action.emit(key);
  }

  protected onArrowKey(index: number, direction: 'left' | 'right'): void {
    const actionButtonCount = this._actionButtons().length;
    const newIndex = (direction === 'left' ? index - 1 : index + 1);
    this._actionButtons()[(newIndex + actionButtonCount) % actionButtonCount]!.nativeElement.focus();
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
