/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchMessageBox} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from 'workbench-testing-app-common';
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
  host: {
    '[style.height]': 'form.controls.height.value',
    '[style.width]': 'form.controls.width.value',
  },
})
export default class HostMessageBoxPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly route = inject(ActivatedRoute);
  protected readonly messageBox = inject(WorkbenchMessageBox);
  protected readonly uuid = UUID.randomUUID();

  protected readonly form = this._formBuilder.group({
    height: this._formBuilder.control(''),
    width: this._formBuilder.control(''),
  });
}
