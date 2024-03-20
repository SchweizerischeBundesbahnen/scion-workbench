/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {ViewId} from '@scion/workbench';
import {SettingsService} from '../../settings.service';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SelectionRegistry} from '../../selection-registry.service';

@Component({
  selector: 'app-selection-test-page',
  templateUrl: './selection-test-page.component.html',
  styleUrls: ['./selection-test-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class SelectionTestPageComponent {

  public form = this._formBuilder.group({
    viewId: this._formBuilder.control('', Validators.required),
    selection: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              private _selectionRegistry: SelectionRegistry) {
  }

  protected onSetSelection(): void {
    const selectionService = this._selectionRegistry.get(this.form.controls.viewId.value as ViewId)!;
    const selection = Object.entries(SciKeyValueFieldComponent.toDictionary(this.form.controls.selection)!)
      .reduce((acc, [type, elements]) => {
        return {
          ...acc,
          [type]: elements.split(/\s+/).filter(Boolean),
        };
      }, {});
    selectionService.setSelection(selection);
    this.resetForm();
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
      this.form.setControl('selection', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
  }
}
