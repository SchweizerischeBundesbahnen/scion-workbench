/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, viewChild} from '@angular/core';
import {ɵWorkbenchDialog} from '../ɵworkbench-dialog.model';
import {SciTextPipe} from '@scion/sci-components/text';
import {SciToolbarComponent} from '@scion/sci-components/menu';
import {dimension} from '@scion/components/dimension';
import {ToolbarVisibilityDirective} from '../../common/toolbar-visibility.directive';

/**
 * Renders the dialog header with a close button and optional title.
 */
@Component({
  selector: 'wb-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss'],
  imports: [
    SciTextPipe,
    SciToolbarComponent,
    ToolbarVisibilityDirective,
  ],
  host: {
    '[style.--ɵdialog-toolbar-width]': '`${toolbarSize().offsetWidth}px`',
  },
})
export class DialogHeaderComponent {

  private readonly _toolbar = viewChild.required(SciToolbarComponent, {read: ElementRef<HTMLElement>});

  protected readonly dialog = inject(ɵWorkbenchDialog);
  protected readonly toolbarSize = dimension(this._toolbar);

  protected onToolbarMouseDown(event: Event): void {
    event.stopPropagation(); // Prevent dragging the dialog when pressing toolbar item, e.g., the close button.
  }

  protected onEscape(event: Event): void {
    event.stopPropagation(); // Prevent dialog from closing.
  }
}
