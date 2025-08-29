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
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';
import {parseTypedString} from '../../common/parse-typed-value.util';
import {APP_IDENTITY} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {SESSION_STORAGE} from '../../session.storage';
import {Translatable, WorkbenchDialog} from '@scion/workbench-client';

@Component({
  selector: 'app-text-test-page',
  templateUrl: './text-test-page.component.html',
  styleUrl: './text-test-page.component.scss',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
})
export default class TextTestPageComponent {

  private readonly _sessionStorage = inject(SESSION_STORAGE);
  private readonly _dialog = inject(WorkbenchDialog, {optional: true});

  protected readonly undefinedList = `autocomplete-list-${UUID.randomUUID()}`;
  protected readonly appSymbolicName = Beans.get(APP_IDENTITY);

  protected readonly provideTextFormGroup = new FormGroup({
    key: new FormControl('', Validators.required),
    text: new FormControl('', Validators.required),
  });

  protected readonly provideValueFormGroup = new FormGroup({
    key: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
  });

  protected onTextSave(): void {
    const key = this.provideTextFormGroup.controls.key.value;
    const text = this.provideTextFormGroup.controls.text.value;
    this._sessionStorage.put(`textprovider.texts.${key}`, parseTypedString(text));
  }

  protected onValueSave(): void {
    const key = this.provideValueFormGroup.controls.key.value;
    const value = this.provideValueFormGroup.controls.value.value;
    this._sessionStorage.put(`textprovider.values.${key}`, parseTypedString(value));
  }

  protected onDialogTitleSet(title: Translatable): void {
    this._dialog!.setTitle(title);
  }
}
