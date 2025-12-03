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
import {WorkbenchPart} from '@scion/workbench-client';
import {JsonPipe, Location} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciViewportComponent} from '@scion/components/viewport';
import {AppendParamDataTypePipe, NullIfEmptyPipe} from 'workbench-testing-app-common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {APP_INSTANCE_ID} from '../app-instance-id';
import {UUID} from '@scion/toolkit/uuid';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-part-page',
  templateUrl: './part-page.component.html',
  styleUrls: ['./part-page.component.scss'],
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
  ],
})
export default class PartPageComponent {

  protected readonly part = inject(WorkbenchPart);
  protected readonly appInstanceId = inject(APP_INSTANCE_ID);
  protected readonly uuid = UUID.randomUUID();
  protected readonly route = inject(ActivatedRoute);
  protected readonly location = inject(Location);
  protected readonly focused = toSignal(inject(WorkbenchPart).focused$, {initialValue: true});
  protected readonly active = toSignal(inject(WorkbenchPart).active$, {initialValue: true});

  constructor() {
    this.part.signalReady();
  }
}
