/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {PartId, WorkbenchDialog, WorkbenchDialogActionDirective, WorkbenchPart, WorkbenchService} from '@scion/workbench';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {UUID} from '@scion/toolkit/uuid';
import {parseTypedString} from 'workbench-testing-app-common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-part-info-dialog',
  templateUrl: './part-info-dialog.component.html',
  styleUrls: ['./part-info-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciFormFieldComponent,
    WorkbenchDialogActionDirective,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class PartInfoDialogComponent {

  private readonly _dialog = inject(WorkbenchDialog);
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _workbenchService = inject(WorkbenchService);

  private _part: WorkbenchPart | null = null;

  protected readonly form = this._formBuilder.group({
    partId: this._formBuilder.control('', Validators.required),
    badge: this._formBuilder.control('', Validators.required),
  });
  protected readonly badgeList = `badge-list-${UUID.randomUUID()}`;

  constructor() {
    this._dialog.title = 'Part Info';
    this._dialog.size.minWidth = '32em';
    this.form.controls.partId.valueChanges.pipe(takeUntilDestroyed()).subscribe(partId => {
      this._part = this._workbenchService.getPart(partId as PartId);
    });
  }

  protected onClose(): void {
    this._dialog.close();
  }

  protected onPartBadgeChange(badge: string): void {
    this._part?.badge.set(parseTypedString(badge)!);
  }
}
