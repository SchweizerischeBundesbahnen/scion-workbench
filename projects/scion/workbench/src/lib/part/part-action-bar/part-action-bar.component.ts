/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
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

  public actions = input.required<WorkbenchPartAction[]>();
}
