/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * Provides a simple filter control.
 */
@Component({
  selector: 'sci-filter-field',
  templateUrl: './filter-field.component.html',
  styleUrls: ['./filter-field.component.scss'],
})
export class SciFilterFieldComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  /**
   * Sets focus order in sequential keyboard navigation.
   * If not specified, the focus order is according to the position in the document (tabindex=0).
   */
  @Input()
  public tabindex = 0;

  /**
   * Emits on filter change.
   */
  @Output()
  public filter = new EventEmitter<string>();

  @ViewChild('input', {static: true})
  private _inputElement: ElementRef<HTMLInputElement>;

  @HostBinding('attr.tabindex')
  public componentTabindex = -1; // component is not focusable in sequential keyboard navigation, but tabindex (if any) is installed on input field

  public formControl: FormControl;

  constructor() {
    this.formControl = new FormControl('', {updateOn: 'change'});
    this.formControl.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(this.filter);
  }

  @HostListener('focus')
  public focus(): void {
    this._inputElement.nativeElement.focus();
  }

  /**
   * Invoke to propagate keyboard events to the filter field.
   *
   * If the keyboard event represents an alphanumeric character, filter text is cleared and the cursor set into the filter field.
   * This allows to start filtering without having to focus the filter field, e.g. if another element has the focus.
   */
  public onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.altKey || event.shiftKey) {
      return;
    }
    if (!isAlphanumeric(event)) {
      return;
    }
    this.formControl.setValue('');
    this._inputElement.nativeElement.focus();
    event.stopPropagation();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function isAlphanumeric(event: KeyboardEvent): boolean {
  return (/^[a-z0-9]$/i.test(event.key));
}

/**
 * Creates a regular expression of the given filter text.
 */
export function toFilterRegExp(filterText: string): RegExp | null {
  if (!filterText) {
    return null;
  }

  // Escape the user filter input and add wildcard support
  const escapedString = filterText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  return new RegExp(escapedString, 'i');
}
