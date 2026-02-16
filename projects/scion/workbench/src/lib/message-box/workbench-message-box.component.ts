/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Component, effect, inject, input, signal} from '@angular/core';
import {MessageBoxFooterComponent} from './message-box-footer/message-box-footer.component';
import {WorkbenchMessageBoxOptions} from './workbench-message-box.options';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog.model';
import {NgComponentOutlet} from '@angular/common';
import {WorkbenchDialogFooterDirective} from '../dialog/dialog-footer/workbench-dialog-footer.directive';
import {WorkbenchDialogHeaderDirective} from '../dialog/dialog-header/workbench-dialog-header.directive';
import {MessageBoxHeaderComponent} from './message-box-header/message-box-header.component';
import {ComponentType} from '@angular/cdk/portal';
import {TypeofPipe} from '../common/typeof.pipe';
import {SciDimension, SciDimensionDirective} from '@scion/components/dimension';
import {TextPipe} from '../text/text.pipe';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Renders the workbench message box.
 *
 * This component is designed to be opened in a workbench dialog.
 */
@Component({
  selector: 'wb-message-box',
  templateUrl: './workbench-message-box.component.html',
  styleUrls: ['./workbench-message-box.component.scss'],
  imports: [
    NgComponentOutlet,
    SciDimensionDirective,
    WorkbenchDialogHeaderDirective,
    WorkbenchDialogFooterDirective,
    MessageBoxHeaderComponent,
    MessageBoxFooterComponent,
    TypeofPipe,
    TextPipe,
  ],
  host: {
    // Ensure host element to be focusable in order to close the message box on Escape keystroke.
    '[attr.tabindex]': '-1',
    '[class.empty]': 'empty()',
    '[class.content-selectable]': 'options()?.contentSelectable',
    '[class.has-title]': '!!this.options()?.title',
    '(keydown.escape)': 'onEscape()',
  },
})
export class WorkbenchMessageBoxComponent {

  public readonly message = input.required({transform: nullIfEmptyMessage});
  public readonly options = input<WorkbenchMessageBoxOptions>();

  private readonly _dialog = inject(ɵWorkbenchDialog);

  protected readonly empty = signal(false);

  constructor() {
    this._dialog.closable = false;
    this._dialog.resizable = false;
    this._dialog.padding = false;

    // Limit the maximum messagebox width if text message to break the message.
    effect(() => {
      if (typeof this.message() === 'string' || this.message() === null) {
        this._dialog.size.maxWidth = 'var(--sci-workbench-messagebox-max-width)';
      }
    });
  }

  protected onAction(action: string): void {
    this._dialog.close(action);
  }

  protected onEscape(): void {
    if ('cancel' in (this.options()?.actions ?? {})) {
      this._dialog.close('cancel');
    }
  }

  protected onFooterPreferredSizeChange(preferredSize: number): void {
    this._dialog.size.minWidth = `${preferredSize}px`;
  }

  protected onContentDimensionChange(dimension: SciDimension): void {
    this.empty.set(!dimension.offsetHeight);
  }
}

function nullIfEmptyMessage(message: Translatable | null | ComponentType<unknown>): Translatable | ComponentType<unknown> | null {
  return message !== '' ? message : null;
}
