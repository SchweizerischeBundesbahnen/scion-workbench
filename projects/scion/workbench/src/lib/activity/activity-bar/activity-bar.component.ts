/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, HostBinding, inject, input} from '@angular/core';
import {MActivityLayout} from '../workbench-activity.model';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {ActivityGroupComponent} from './activity-group/activity-group.component';

@Component({
  selector: 'wb-activity-bar',
  templateUrl: './activity-bar.component.html',
  styleUrls: ['./activity-bar.component.scss'],
  standalone: true,
  imports: [
    ActivityGroupComponent,
  ],
})
export class ActivityBarComponent {

  public readonly side = input.required<'left' | 'right'>();

  @HostBinding('class.left')
  protected get left(): boolean {
    return this.side() === 'left';
  }

  @HostBinding('class.right')
  protected get right(): boolean {
    return this.side() === 'right';
  }

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);

  protected readonly activityLayout = computed((): MActivityLayout | undefined => this._workbenchLayoutService.layout()?.activityLayout);
}
