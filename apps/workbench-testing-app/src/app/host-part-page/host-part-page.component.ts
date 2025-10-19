/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciViewportComponent} from '@scion/components/viewport';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedMicrofrontend, WorkbenchPart} from '@scion/workbench';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';

@Component({
  selector: 'app-host-part-page',
  templateUrl: './host-part-page.component.html',
  styleUrls: ['./host-part-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    JsonPipe,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciViewportComponent,
    AppendParamDataTypePipe,
    SciKeyValueComponent,
    NullIfEmptyPipe,
    FormsModule,
    AppendParamDataTypePipe,
    NullIfEmptyPipe,
    NullIfEmptyPipe,
    AppendParamDataTypePipe,
  ],
})
export default class PartPageComponent {

  protected readonly part = inject(WorkbenchPart);
  protected readonly activatedMicrofrontend = inject(ActivatedMicrofrontend);
  protected readonly uuid = UUID.randomUUID();
}
