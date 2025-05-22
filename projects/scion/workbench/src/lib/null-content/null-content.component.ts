/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, isDevMode} from '@angular/core';
import {TextPipe} from '../text/text.pipe';
import {WorkbenchView} from '../view/workbench-view.model';

/**
 * Indicates that there is no content to display.
 */
@Component({
  selector: 'wb-null-content',
  templateUrl: './null-content.component.html',
  styleUrls: ['./null-content.component.scss'],
  imports: [
    TextPipe,
  ],
})
export class NullContentComponent {

  protected readonly isDevMode = isDevMode();
  protected readonly view = inject(WorkbenchView, {optional: true});
}
