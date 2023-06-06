/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {WorkbenchPart} from '../workbench-part.model';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {PartActionFilterPipe} from './part-action-filter.pipe';
import {NullIfEmptyPipe} from '../../common/null-if-empty.pipe';
import {PortalModule} from '@angular/cdk/portal';

@Component({
  selector: 'wb-part-action-bar',
  templateUrl: './part-action-bar.component.html',
  styleUrls: ['./part-action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    NgClass,
    PortalModule,
    PartActionFilterPipe,
    NullIfEmptyPipe,
  ],
})
export class PartActionBarComponent {

  constructor(public part: WorkbenchPart) {
  }
}
