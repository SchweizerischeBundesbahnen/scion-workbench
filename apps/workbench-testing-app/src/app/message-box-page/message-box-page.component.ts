/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-message-box-page',
  templateUrl: './message-box-page.component.html',
  styleUrls: ['./message-box-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciFormFieldComponent,
  ],
})
export class MessageBoxPageComponent {

  public readonly input = input<string>();
  public readonly param1 = input<string>();
  public readonly param2 = input<string>();
}
