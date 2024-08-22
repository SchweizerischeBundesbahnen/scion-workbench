/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, Signal} from '@angular/core';
import {WorkbenchPart} from '../workbench-part.model';
import {NgClass} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {WorkbenchPartAction} from '../../workbench.model';

@Component({
  selector: 'wb-part-action-bar',
  templateUrl: './part-action-bar.component.html',
  styleUrls: ['./part-action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    PortalModule,
  ],
})
export class PartActionBarComponent {

  protected startActions: Signal<WorkbenchPartAction[]>;
  protected endActions: Signal<WorkbenchPartAction[]>;

  constructor(part: WorkbenchPart) {
    this.startActions = computed(() => part.actions().filter(action => action.align !== 'end'));
    this.endActions = computed(() => part.actions().filter(action => action.align === 'end'));
  }
}
