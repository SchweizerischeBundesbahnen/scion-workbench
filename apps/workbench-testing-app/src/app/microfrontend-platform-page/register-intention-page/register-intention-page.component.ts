/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Intention, ManifestService, mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {stringifyError} from '../../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {UUID} from '@scion/toolkit/uuid';
import {SettingsService} from '../../settings.service';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-register-intention-page',
  templateUrl: './register-intention-page.component.html',
  styleUrls: ['./register-intention-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
  ],
})
export class RegisterIntentionPageComponent {

  protected form = this._formBuilder.group({
    application: this._formBuilder.control('', Validators.required),
    type: this._formBuilder.control('', Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  public intentionId: string | undefined;
  public registerError: string | undefined;
  protected applications: string[];
  public WorkbenchCapabilities = WorkbenchCapabilities;
  protected intentionTypeList = `intention-type-list-${UUID.randomUUID()}`;

  constructor(manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _settingsService: SettingsService,
              private _formBuilder: NonNullableFormBuilder) {
    this.applications = manifestService.applications
      .filter(application => application.symbolicName.startsWith('workbench'))
      .map(application => application.symbolicName);
  }

  protected async onRegister(): Promise<void> {
    const intention: Intention = {
      type: this.form.controls.type.value,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier) ?? undefined,
    };

    this.intentionId = undefined;
    this.registerError = undefined;
    try {
      this.intentionId = await firstValueFrom(this._messageClient.request$<string>(`application/${this.form.controls.application.value}/intention/register`, intention).pipe(mapToBody()));
      this.resetForm();
    }
    catch (error) {
      this.registerError = stringifyError(error);
    }
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
      this.form.setControl('qualifier', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
  }
}
