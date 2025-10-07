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
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {WorkbenchView} from '@scion/workbench';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {JoinPipe} from '../common/join.pipe';
import {AsyncPipe} from '@angular/common';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';

/**
 * View component provided by the host app via a view capability.
 */
@Component({
  selector: 'app-host-view-page',
  templateUrl: './host-view-page.component.html',
  styleUrls: ['./host-view-page.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SciFormFieldComponent,
    NullIfEmptyPipe,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    JoinPipe,
    AsyncPipe,
    AppendParamDataTypePipe,

  ],
})
export default class HostViewPageComponent {

  protected readonly view = inject(WorkbenchView);
  protected readonly route = inject(ActivatedRoute);
  protected readonly uuid = UUID.randomUUID();
}
