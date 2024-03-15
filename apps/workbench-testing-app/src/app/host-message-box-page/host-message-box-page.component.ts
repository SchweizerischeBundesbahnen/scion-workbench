/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding} from '@angular/core';
import {WorkbenchMessageBox} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';

/**
 * Message box test component provided by the workbench host application.
 */
@Component({
  selector: 'app-host-message-box-page',
  templateUrl: './host-message-box-page.component.html',
  styleUrls: ['./host-message-box-page.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    FormsModule,
    NullIfEmptyPipe,
    ReactiveFormsModule,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
  ],
})
export default class HostMessageBoxPageComponent {

  protected uuid = UUID.randomUUID();

  @HostBinding('style.width')
  protected get width(): string {
    return this.form.controls.width.value;
  }

  @HostBinding('style.height')
  protected get height(): string {
    return this.form.controls.height.value;
  }

  protected form = this._formBuilder.group({
    height: this._formBuilder.control(''),
    width: this._formBuilder.control(''),
  });

  constructor(private _formBuilder: NonNullableFormBuilder,
              protected route: ActivatedRoute,
              protected messageBox: WorkbenchMessageBox) {
  }
}
