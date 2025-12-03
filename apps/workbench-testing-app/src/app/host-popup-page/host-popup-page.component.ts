/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {WorkbenchPopup} from '@scion/workbench-client';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciViewportComponent} from '@scion/components/viewport';
import {NullIfEmptyPipe} from 'workbench-testing-app-common';
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
  host: {
    '[style.height]': 'form.controls.componentSize.controls.height.value',
    '[style.width]': 'form.controls.componentSize.controls.width.value',
    '[style.min-height]': 'form.controls.componentSize.controls.minHeight.value',
    '[style.max-height]': 'form.controls.componentSize.controls.maxHeight.value',
    '[style.min-width]': 'form.controls.componentSize.controls.minWidth.value',
    '[style.max-width]': 'form.controls.componentSize.controls.maxWidth.value',
  },
})
export default class HostPopupPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly route = inject(ActivatedRoute);
  protected readonly popup = inject(WorkbenchPopup);
  protected readonly uuid = UUID.randomUUID();

  protected readonly form = this._formBuilder.group({
    componentSize: this._formBuilder.group({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    closeWithError: this._formBuilder.control(false),
    result: this._formBuilder.control(''),
  });

  protected onApplyReturnValue(): void {
    this.popup.setResult(this.form.controls.result.value);
  }

  protected onClose(): void {
    const result = this.form.controls.closeWithError.value ? new Error(this.form.controls.result.value) : this.form.controls.result.value;
    this.popup.close(result);
  }
}
