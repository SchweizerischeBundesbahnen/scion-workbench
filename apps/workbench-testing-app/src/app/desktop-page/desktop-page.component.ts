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
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WorkbenchDesktop} from '@scion/workbench';
import {JoinPipe} from '../common/join.pipe';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';
import {CssClassComponent} from '../css-class/css-class.component';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-desktop-page',
  templateUrl: './desktop-page.component.html',
  styleUrls: ['./desktop-page.component.scss'],
  standalone: true,
  imports: [
    SciFormFieldComponent,
    JoinPipe,
    AsyncPipe,
    NullIfEmptyPipe,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    AppendParamDataTypePipe,
    CssClassComponent,
    ReactiveFormsModule,
  ],
})
export default class DesktopPageComponent {

  protected uuid = UUID.randomUUID();
  protected form = inject(NonNullableFormBuilder).group({
    cssClass: inject(NonNullableFormBuilder).control(''),
  });
  protected desktop = inject(WorkbenchDesktop);
  protected route = inject(ActivatedRoute);
}
