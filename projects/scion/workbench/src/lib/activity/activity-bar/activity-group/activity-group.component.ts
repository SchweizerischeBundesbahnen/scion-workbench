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
import {MActivityGroup} from '../../workbench-activity.model';
import {ActivityItemComponent} from '../activity-item/activity-item.component';

@Component({
  selector: 'wb-activity-group',
  templateUrl: './activity-group.component.html',
  styleUrls: ['./activity-group.component.scss'],
  imports: [
    ActivityItemComponent,
  ],
})
export class ActivityGroupComponent {

  public readonly group = input.required<MActivityGroup>();
}
