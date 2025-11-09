/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchRouter} from '@scion/workbench';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-part-opener-page',
  templateUrl: './part-opener-page.component.html',
  styleUrl: './part-opener-page.component.scss',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
})
export default class PartOpenerPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(WorkbenchRouter);

  protected readonly form = this._formBuilder.group({
    path: this._formBuilder.control('test-part', Validators.required),
    dockTo: this._formBuilder.control<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'>('left-top'),
    icon: this._formBuilder.control('folder'),
    label: this._formBuilder.control('Workbench Part'),
  });

  protected onOpenPart(): void {
    const partId = UUID.randomUUID();
    const path = this.form.controls.path.value;
    const dockTo = this.form.controls.dockTo.value;
    const icon = this.form.controls.icon.value;
    const label = this.form.controls.label.value;

    void this._router.navigate(layout => layout
      .addPart(partId, {dockTo}, {icon, label, activate: true})
      .navigatePart(partId, [path]),
    );
  }
}
