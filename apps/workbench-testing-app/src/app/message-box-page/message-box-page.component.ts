/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Input} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-message-box-page',
  templateUrl: './message-box-page.component.html',
  styleUrls: ['./message-box-page.component.scss'],
  standalone: true,
  imports: [
    SciFormFieldComponent,
  ],
})
export class MessageBoxPageComponent {

  @Input()
  public input: string | undefined;

  @Input()
  public param1: string | undefined;

  @Input()
  public param2: string | undefined;
}
