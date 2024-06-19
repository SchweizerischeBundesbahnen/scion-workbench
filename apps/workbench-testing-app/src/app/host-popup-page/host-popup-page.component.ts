/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {WorkbenchPopup} from '@scion/workbench-client';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciViewportComponent} from '@scion/components/viewport';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';

/**
 * Popup component provided by the host app via a popup capability.
 */
@Component({
  selector: 'app-host-popup-page',
  templateUrl: './host-popup-page.component.html',
  styleUrls: ['./host-popup-page.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    JsonPipe,
    A11yModule,
    NullIfEmptyPipe,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    ReactiveFormsModule,
  ],
})
export default class HostPopupPageComponent {

  public uuid = UUID.randomUUID();

  @HostBinding('style.min-height')
  public get minHeight(): string {
    return this.form.controls.minHeight.value;
  }

  @HostBinding('style.height')
  public get height(): string {
    return this.form.controls.height.value;
  }

  @HostBinding('style.max-height')
  public get maxHeight(): string {
    return this.form.controls.maxHeight.value;
  }

  @HostBinding('style.min-width')
  public get minWidth(): string {
    return this.form.controls.minWidth.value;
  }

  @HostBinding('style.width')
  public get width(): string {
    return this.form.controls.width.value;
  }

  @HostBinding('style.max-width')
  public get maxWidth(): string {
    return this.form.controls.maxWidth.value;
  }

  public form = this._formBuilder.group({
    minHeight: this._formBuilder.control(''),
    height: this._formBuilder.control(''),
    maxHeight: this._formBuilder.control(''),
    minWidth: this._formBuilder.control(''),
    width: this._formBuilder.control(''),
    maxWidth: this._formBuilder.control(''),
    result: this._formBuilder.control(''),
  });

  constructor(public route: ActivatedRoute,
              public popup: WorkbenchPopup,
              private _formBuilder: NonNullableFormBuilder) {
  }

  public onClose(): void {
    this.popup.close(this.form.controls.result.value);
  }

  public onCloseWithError(): void {
    this.popup.closeWithError(this.form.controls.result.value);
  }
}
