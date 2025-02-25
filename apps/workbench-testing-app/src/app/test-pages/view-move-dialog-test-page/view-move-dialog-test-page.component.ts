/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Input} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WORKBENCH_ID, WorkbenchDialog, WorkbenchDialogActionDirective, WorkbenchView} from '@scion/workbench';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-view-move-dialog-test-page',
  templateUrl: './view-move-dialog-test-page.component.html',
  styleUrls: ['./view-move-dialog-test-page.component.scss'],
  imports: [
    SciFormFieldComponent,
    ReactiveFormsModule,
    WorkbenchDialogActionDirective,
  ],
})
export class ViewMoveDialogTestPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _dialog = inject(WorkbenchDialog);

  protected readonly targetList = `target-list-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
    workbenchId: this._formBuilder.control<string | 'new-window'>(inject(WORKBENCH_ID)),
    partId: this._formBuilder.control('', Validators.required),
    region: this._formBuilder.control<'north' | 'south' | 'west' | 'east' | ''>(''),
  });

  @Input({required: true})
  public view!: WorkbenchView;

  constructor() {
    this._dialog.title = 'Move view';
    this.requirePartIfMovingToExistingWindow();
  }

  protected onOk(): void {
    if (this.form.controls.workbenchId.value === 'new-window') {
      this.view.move('new-window');
    }
    else {
      this.view.move(this.form.controls.partId.value, {
        region: this.form.controls.region.value || undefined,
        workbenchId: this.form.controls.workbenchId.value || undefined,
      });
    }
    this._dialog.close();
  }

  protected onCancel(): void {
    this._dialog.close();
  }

  /**
   * Makes the part a required field if not moving the view to a new window.
   */
  private requirePartIfMovingToExistingWindow(): void {
    this.form.controls.workbenchId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(target => {
        if (target === 'new-window') {
          this.form.controls.partId.removeValidators(Validators.required);
        }
        else {
          this.form.controls.partId.addValidators(Validators.required);
        }
        this.form.controls.partId.updateValueAndValidity();
      });
  }
}
