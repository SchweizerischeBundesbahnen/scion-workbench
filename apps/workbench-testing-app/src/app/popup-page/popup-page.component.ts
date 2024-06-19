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
import {Popup} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {JsonPipe} from '@angular/common';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';

@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrls: ['./popup-page.component.scss'],
  standalone: true,
  imports: [
    JsonPipe,
    FormsModule,
    NullIfEmptyPipe,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    ReactiveFormsModule,
  ],
})
export class PopupPageComponent {

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

  constructor(public popup: Popup, private _formBuilder: NonNullableFormBuilder) {
  }

  public onClose(): void {
    this.popup.close(this.form.controls.result.value);
  }

  public onCloseWithError(): void {
    this.popup.closeWithError(this.form.controls.result.value);
  }
}
