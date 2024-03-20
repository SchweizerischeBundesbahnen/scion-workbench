/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, OnDestroy} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WorkbenchSelectionService, WorkbenchView} from '@scion/workbench';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SettingsService} from '../../settings.service';
import {SelectionRegistry} from '../../selection-registry.service';

@Component({
  selector: 'app-selection-provider-page',
  templateUrl: './selection-provider-page.component.html',
  styleUrls: ['./selection-provider-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class SelectionProviderPageComponent implements OnDestroy {

  public form = this._formBuilder.group({
    selection: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _selectionService: WorkbenchSelectionService,
              private _settingsService: SettingsService,
              private _view: WorkbenchView,
              private _selectionRegistry: SelectionRegistry) {
    this._selectionRegistry.register(this._view.id, this._selectionService);
  }

  protected onSetSelection(): void {
    const selection = Object.entries(SciKeyValueFieldComponent.toDictionary(this.form.controls.selection)!)
      .reduce((acc, [type, elements]) => {
        return {
          ...acc,
          [type]: elements.split(/\s+/).filter(Boolean),
        };
      }, {});
    this._selectionService.setSelection(selection);
    this.resetForm();
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
      this.form.setControl('selection', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
  }

  public ngOnDestroy(): void {
    this._selectionRegistry.unregister(this._view.id);
  }
}
