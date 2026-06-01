/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, input} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import ActivatedMicrofrontendComponent from '../activated-microfrontend/activated-microfrontend.component';
import {ActivatedMicrofrontend} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';

@Component({
  selector: 'app-message-box-page',
  templateUrl: './message-box-page.component.html',
  styleUrls: ['./message-box-page.component.scss'],
  imports: [
    SciFormFieldComponent,
    ActivatedMicrofrontendComponent,
    FormsModule,
    SciAccordionComponent,
    SciAccordionItemDirective,
    ReactiveFormsModule,
  ],
  host: {
    '[style.height]': 'form.controls.componentSize.controls.height.value',
    '[style.width]': 'form.controls.componentSize.controls.width.value',
    '[attr.data-component-instance-id]': `uuid`,
  },
})
export default class MessageBoxPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly activatedMicrofrontend = inject(ActivatedMicrofrontend, {optional: true});
  protected readonly uuid = UUID.randomUUID();

  public readonly input = input<string>();

  protected readonly form = this._formBuilder.group({
    componentSize: new FormGroup({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
    }),
  });
}
