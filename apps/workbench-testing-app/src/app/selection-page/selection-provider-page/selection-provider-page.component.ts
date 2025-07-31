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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WorkbenchSelection, WorkbenchSelectionService} from '@scion/workbench';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';

@Component({
  selector: 'app-selection-provider-page',
  templateUrl: './selection-provider-page.component.html',
  styleUrls: ['./selection-provider-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class SelectionProviderPageComponent {

  private readonly _selectionService = inject(WorkbenchSelectionService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  public form = this._formBuilder.group({
    selection: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  protected onSetSelection(): void {
    const selection = Object.entries(SciKeyValueFieldComponent.toDictionary(this.form.controls.selection)!)
      .reduce((acc, [type, elements]) => {
        return {
          ...acc,
          [type]: elements.split(/\s+/).filter(Boolean),
        };
      }, {} as WorkbenchSelection);
    this._selectionService.setSelection(selection);
  }
}
