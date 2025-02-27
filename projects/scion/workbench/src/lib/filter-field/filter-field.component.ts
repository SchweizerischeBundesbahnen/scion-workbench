/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {booleanAttribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostBinding, HostListener, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {noop} from 'rxjs';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UUID} from '@scion/toolkit/uuid';

/**
 * Provides a filter control.
 */
@Component({
  selector: 'wb-filter-field',
  templateUrl: './filter-field.component.html',
  styleUrls: ['./filter-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => FilterFieldComponent)},
  ],
})
export class FilterFieldComponent implements ControlValueAccessor, OnDestroy {

  private _cvaChangeFn: (value: string) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  public readonly id = UUID.randomUUID();

  /**
   * Sets focus order in sequential keyboard navigation.
   * If not specified, the focus order is according to the position in the document (tabindex=0).
   */
  @Input()
  public tabindex?: number | undefined;

  /**
   * Specifies the hint displayed when this field is empty.
   */
  @Input()
  public placeholder?: string | undefined;

  @Input()
  public set disabled(disabled: boolean | string | undefined | null) {
    booleanAttribute(disabled) ? this.formControl.disable() : this.formControl.enable();
  }

  public get disabled(): boolean {
    return this.formControl.disabled;
  }

  /**
   * Emits on filter change.
   */
  @Output()
  public filter = new EventEmitter<string>();

  @ViewChild('input', {static: true})
  private _inputElement!: ElementRef<HTMLInputElement>;

  @HostBinding('attr.tabindex')
  public componentTabindex = -1; // component is not focusable in sequential keyboard navigation, but tabindex (if any) is installed on input field

  @HostBinding('class.empty')
  public get empty(): boolean {
    return !this.formControl.value;
  }

  /* @docs-private */
  public formControl: FormControl<string>;

  constructor(private _host: ElementRef<HTMLElement>,
              private _focusManager: FocusMonitor,
              private _cd: ChangeDetectorRef) {
    this.formControl = new FormControl('', {updateOn: 'change', nonNullable: true});
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this._cvaChangeFn(value);
        this.filter.emit(value);
      });

    this._focusManager.monitor(this._host.nativeElement, true)
      .pipe(takeUntilDestroyed())
      .subscribe((focusOrigin: FocusOrigin) => {
        if (!focusOrigin) {
          this._cvaTouchedFn(); // triggers form field validation and signals a blur event
        }
      });
  }

  @HostListener('focus')
  public focus(): void {
    this._inputElement.nativeElement.focus();
  }

  public onClear(): void {
    this.formControl.setValue('');
    this.focus(); // restore the focus
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: string) => void): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: () => void): void {
    this._cvaTouchedFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._cd.markForCheck();
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: string | null | undefined): void {
    this.formControl.setValue(value ?? '', {emitEvent: false});
    this._cd.markForCheck();
  }

  public ngOnDestroy(): void {
    this._focusManager.stopMonitoring(this._host.nativeElement);
  }
}
