/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, input} from '@angular/core';
import {ActivityStackComponent} from './activity-stack/activity-stack.component';
import {ɵWorkbenchService} from '../../ɵworkbench.service';

/**
 * Renders the activity bar of a given workbench side.
 */
@Component({
  selector: 'wb-activity-bar',
  templateUrl: './activity-bar.component.html',
  styleUrls: ['./activity-bar.component.scss'],
  imports: [
    ActivityStackComponent,
  ],
  host: {
    '[attr.data-align]': 'align()',
  },
})
export class ActivityBarComponent {

  public readonly align = input.required<'left' | 'right'>();

  protected readonly layout = inject(ɵWorkbenchService).layout;
}
