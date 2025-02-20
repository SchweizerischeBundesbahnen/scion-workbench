/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {ɵWorkbenchDialog} from '../ɵworkbench-dialog';

/**
 * Renders the dialog header with a close button and optional title.
 */
@Component({
  selector: 'wb-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss'],
})
export class DialogHeaderComponent {

  constructor(protected dialog: ɵWorkbenchDialog) {
  }

  protected onCloseClick(): void {
    this.dialog.close();
  }

  protected onCloseMouseDown(event: Event): void {
    event.stopPropagation(); // Prevent dragging the dialog with the close button.
  }
}
