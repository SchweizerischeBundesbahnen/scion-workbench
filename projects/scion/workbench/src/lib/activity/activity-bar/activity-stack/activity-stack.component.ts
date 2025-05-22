/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, input} from '@angular/core';
import {MActivityStack} from '../../workbench-activity.model';
import {ActivityItemComponent} from '../activity-item/activity-item.component';

/**
 * Represents the stack of activities in a docking area.
 */
@Component({
  selector: 'wb-activity-stack',
  templateUrl: './activity-stack.component.html',
  styleUrls: ['./activity-stack.component.scss'],
  imports: [
    ActivityItemComponent,
  ],
})
export class ActivityStackComponent {

  public readonly stack = input.required<MActivityStack>();
}
