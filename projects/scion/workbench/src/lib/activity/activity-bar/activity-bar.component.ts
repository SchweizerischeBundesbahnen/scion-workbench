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
import {ActivityGroupComponent} from './activity-group/activity-group.component';
import {ɵWorkbenchService} from '../../ɵworkbench.service';

@Component({
  selector: 'wb-activity-bar',
  templateUrl: './activity-bar.component.html',
  styleUrls: ['./activity-bar.component.scss'],
  standalone: true,
  imports: [
    ActivityGroupComponent,
  ],
  host: {
    '[attr.data-align]': 'align()',
  },
})
export class ActivityBarComponent {

  public readonly align = input.required<'left' | 'right'>();

  protected readonly workbenchService = inject(ɵWorkbenchService);
}
