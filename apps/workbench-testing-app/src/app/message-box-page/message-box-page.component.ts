/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import ActivatedMicrofrontendComponent from '../activated-microfrontend/activated-microfrontend.component';
import {ActivatedMicrofrontend} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-message-box-page',
  templateUrl: './message-box-page.component.html',
  styleUrls: ['./message-box-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciFormFieldComponent,
    ActivatedMicrofrontendComponent,
  ],
})
export default class MessageBoxPageComponent {

  protected readonly activatedMicrofrontend = inject(ActivatedMicrofrontend, {optional: true});
  protected readonly uuid = UUID.randomUUID();

  public readonly input = input<string>();
}
