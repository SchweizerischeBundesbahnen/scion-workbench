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
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ActivityId, MActivityGroup} from '../../workbench-activity.model';
import {ɵWorkbenchRouter} from '../../../routing/ɵworkbench-router.service';

@Component({
  selector: 'wb-activity-group',
  templateUrl: './activity-group.component.html',
  styleUrls: ['./activity-group.component.scss'],
  standalone: true,
  imports: [
    SciMaterialIconDirective,
  ],
})
export class ActivityGroupComponent {

  public readonly group = input.required<MActivityGroup>();

  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  protected toggleActivity(id: ActivityId, enable: boolean): void {
    void this._workbenchRouter.navigate(layout => enable ? layout.activateActivity(id) : layout.deactivateActivity(id));
  }
}
