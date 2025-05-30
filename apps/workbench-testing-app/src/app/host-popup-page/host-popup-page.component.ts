/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {WorkbenchPopup} from '@scion/workbench-client';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciViewportComponent} from '@scion/components/viewport';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

/**
 * Popup component provided by the host app via a popup capability.
 */
@Component({
  selector: 'app-host-popup-page',
  templateUrl: './host-popup-page.component.html',
  styleUrls: ['./host-popup-page.component.scss'],
  imports: [
    FormsModule,
    AsyncPipe,
    JsonPipe,
    CdkTrapFocus,
    NullIfEmptyPipe,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    ReactiveFormsModule,
    SciCheckboxComponent,
  ],
})
export default class HostPopupPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly route = inject(ActivatedRoute);
  protected readonly popup = inject(WorkbenchPopup);
  protected readonly uuid = UUID.randomUUID();

  protected readonly form = this._formBuilder.group({
    minHeight: this._formBuilder.control(''),
    height: this._formBuilder.control(''),
    maxHeight: this._formBuilder.control(''),
    minWidth: this._formBuilder.control(''),
    width: this._formBuilder.control(''),
    maxWidth: this._formBuilder.control(''),
    closeWithError: this._formBuilder.control(false),
    result: this._formBuilder.control(''),
  });

  @HostBinding('style.min-height')
  protected get minHeight(): string {
    return this.form.controls.minHeight.value;
  }

  @HostBinding('style.height')
  protected get height(): string {
    return this.form.controls.height.value;
  }

  @HostBinding('style.max-height')
  protected get maxHeight(): string {
    return this.form.controls.maxHeight.value;
  }

  @HostBinding('style.min-width')
  protected get minWidth(): string {
    return this.form.controls.minWidth.value;
  }

  @HostBinding('style.width')
  protected get width(): string {
    return this.form.controls.width.value;
  }

  @HostBinding('style.max-width')
  protected get maxWidth(): string {
    return this.form.controls.maxWidth.value;
  }

  protected onApplyReturnValue(): void {
    this.popup.setResult(this.form.controls.result.value);
  }

  protected onClose(): void {
    const result = this.form.controls.closeWithError.value ? new Error(this.form.controls.result.value) : this.form.controls.result.value;
    this.popup.close(result);
  }
}
