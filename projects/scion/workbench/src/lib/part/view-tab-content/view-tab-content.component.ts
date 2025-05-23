/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchView} from '../../view/workbench-view.model';
import {TextPipe} from '../../text/text.pipe';
import {IconComponent} from '../../icon/icon.component';

@Component({
  selector: 'wb-view-tab-content',
  templateUrl: './view-tab-content.component.html',
  styleUrls: ['./view-tab-content.component.scss'],
  imports: [
    TextPipe,
    IconComponent,
  ],
})
export class ViewTabContentComponent {

  protected readonly view = inject(WorkbenchView);
}
