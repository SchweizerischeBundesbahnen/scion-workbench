/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Component, input} from '@angular/core';
import {Translatable} from '../../text/workbench-text-provider.model';
import {TextPipe} from '../../text/text.pipe';

@Component({
  selector: 'wb-message-box-header',
  templateUrl: './message-box-header.component.html',
  styleUrls: ['./message-box-header.component.scss'],
  imports: [
    TextPipe,
  ],
  host: {
    '[attr.data-severity]': 'severity()',
  },
})
export class MessageBoxHeaderComponent {

  public readonly title = input<Translatable | undefined>();
  public readonly severity = input.required<'info' | 'warn' | 'error'>();
}
