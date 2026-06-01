/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, signal} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Intention, ManifestService} from '@scion/microfrontend-platform';
import {WORKBENCH_ELEMENT, WorkbenchCapabilities, WorkbenchElement} from '@scion/workbench-client';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {stringifyError} from 'workbench-testing-app-common';
import {Beans} from '@scion/toolkit/bean-manager';

@Component({
  selector: 'app-register-workbench-intention-page',
  templateUrl: './register-workbench-intention-page.component.html',
  styleUrls: ['./register-workbench-intention-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
  ],
})
export class RegisterWorkbenchIntentionPageComponent {

  private readonly _manifestService = inject(ManifestService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    type: this._formBuilder.control('', Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  protected readonly WorkbenchCapabilities = WorkbenchCapabilities;

  protected intentionId = signal<string | undefined>(undefined);
  protected registerError = signal<string | undefined>(undefined);

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();
  }

  protected async onRegister(): Promise<void> {
    const intention: Intention = {
      type: this.form.controls.type.value,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier) ?? undefined,
    };

    this.intentionId.set(undefined);
    this.registerError.set(undefined);

    await this._manifestService.registerIntention(intention)
      .then(id => {
        this.intentionId.set(id);
        this.form.reset();
        this.form.setControl('qualifier', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
      })
      .catch((error: unknown) => this.registerError.set(stringifyError(error)));
  }
}
