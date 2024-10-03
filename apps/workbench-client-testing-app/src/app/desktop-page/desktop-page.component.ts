/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchDesktop} from '@scion/workbench-client';
import {AppendParamDataTypePipe} from '../../../../workbench-testing-app/src/app/common/append-param-data-type.pipe';
import {AsyncPipe, Location} from '@angular/common';
import {NullIfEmptyPipe} from '../../../../workbench-testing-app/src/app/common/null-if-empty.pipe';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {ActivatedRoute} from '@angular/router';
import {APP_INSTANCE_ID} from '../app-instance-id';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-desktop-page',
  templateUrl: './desktop-page.component.html',
  styleUrls: ['./desktop-page.component.scss'],
  standalone: true,
  imports: [
    AppendParamDataTypePipe,
    AsyncPipe,
    NullIfEmptyPipe,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciFormFieldComponent,
    SciKeyValueComponent,
  ],
})
export default class DesktopPageComponent {

  protected uuid = UUID.randomUUID();
  protected route = inject(ActivatedRoute);
  protected location = inject(Location);
  protected appInstanceId = inject(APP_INSTANCE_ID);

  constructor() {
    inject(WorkbenchDesktop).signalReady();
  }
}
