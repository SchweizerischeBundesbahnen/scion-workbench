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
import {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from '../../workbench.constants';
import {TextPipe} from '../../text/text.pipe';

@Component({
  selector: 'wb-view-tab-content',
  templateUrl: './view-tab-content.component.html',
  styleUrls: ['./view-tab-content.component.scss'],
  imports: [
    TextPipe,
  ],
  host: {
    '[attr.context]': 'context',
  },
})
export class ViewTabContentComponent {

  protected readonly view = inject(WorkbenchView);
  protected readonly context = inject<ViewTabRenderingContext>(VIEW_TAB_RENDERING_CONTEXT);
}
