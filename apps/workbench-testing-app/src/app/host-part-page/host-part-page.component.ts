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
import {WorkbenchPart} from '@scion/workbench';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {JoinPipe} from '../common/join.pipe';

/**
 * Part component provided by the host app via a part capability.
 */
@Component({
  selector: 'app-host-part-page',
  templateUrl: './host-part-page.component.html',
  styleUrls: ['./host-part-page.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SciFormFieldComponent,
    NullIfEmptyPipe,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    JoinPipe,
  ],
})
export default class HostPartPageComponent {

  protected readonly part = inject(WorkbenchPart);
  protected readonly route = inject(ActivatedRoute);
  protected readonly uuid = UUID.randomUUID();
}
