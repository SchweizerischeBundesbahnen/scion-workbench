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
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ManifestService, mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {stringifyError} from '../../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SettingsService} from '../../settings.service';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-unregister-capability-page',
  templateUrl: './unregister-capability-page.component.html',
  styleUrls: ['./unregister-capability-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
})
export class UnregisterCapabilityPageComponent {

  protected form = this._formBuilder.group({
    application: this._formBuilder.control('', Validators.required),
    id: this._formBuilder.control('', Validators.required),
  });
  protected unregisterError: string | undefined;
  protected unregistered: boolean | undefined;
  protected applications: string[];

  constructor(manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _settingsService: SettingsService,
              private _formBuilder: NonNullableFormBuilder) {
    this.applications = manifestService.applications
      .filter(application => application.symbolicName.startsWith('workbench'))
      .map(application => application.symbolicName);
  }

  protected async onUnregister(): Promise<void> {
    this.unregisterError = undefined;
    this.unregistered = undefined;
    try {
      const capabilityId = this.form.controls.id.value;
      this.unregistered = await firstValueFrom(this._messageClient.request$<boolean>(`application/${this.form.controls.application.value}/capability/${capabilityId}/unregister`).pipe(mapToBody()));
      this.resetForm();
    }
    catch (error) {
      this.unregisterError = stringifyError(error);
    }
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
    }
  }
}
