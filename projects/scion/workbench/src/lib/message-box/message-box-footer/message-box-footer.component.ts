/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Component, ElementRef, EventEmitter, HostBinding, inject, Input, NgZone, Output, QueryList, ViewChildren} from '@angular/core';
import {KeyValuePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromDimension$} from '@scion/toolkit/observable';
import {take, tap} from 'rxjs/operators';
import {observeInside} from '@scion/toolkit/operators';

@Component({
  selector: 'wb-message-box-footer',
  templateUrl: './message-box-footer.component.html',
  styleUrls: ['./message-box-footer.component.scss'],
  standalone: true,
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
    this.emitPreferredSize();
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

  private emitPreferredSize(): void {
    const host = inject(ElementRef).nativeElement;
    const zone = inject(NgZone);

    fromDimension$(host)
      .pipe(
        observeInside(fn => zone.run(fn)), /* fromDimension$ emits outside the Angular zone */
        tap({
          subscribe: () => host.classList.add('calculating-min-width'),
          finalize: () => host.classList.remove('calculating-min-width'),
        }),
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe(dimension => {
        this.preferredSizeChange.emit(dimension.offsetWidth);
      });
  }
}
