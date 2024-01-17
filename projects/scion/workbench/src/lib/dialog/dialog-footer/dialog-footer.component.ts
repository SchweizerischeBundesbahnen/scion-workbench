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
import {NgTemplateOutlet} from '@angular/common';
import {NullIfEmptyPipe} from '../../common/null-if-empty.pipe';
import {DialogActionFilterPipe} from './dialog-action-filter.pipe';

/**
 * Renders the dialog footer with actions modeled as {@link WorkbenchDialogActionDirective} templates.
 */
@Component({
  selector: 'wb-dialog-footer',
  templateUrl: './dialog-footer.component.html',
  styleUrls: ['./dialog-footer.component.scss'],
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NullIfEmptyPipe,
    DialogActionFilterPipe,
  ],
})
export class DialogFooterComponent {

  constructor(protected dialog: ɵWorkbenchDialog) {
  }
}
