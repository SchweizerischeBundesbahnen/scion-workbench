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
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ManifestService} from '@scion/microfrontend-platform';
import {stringifyError} from '../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WorkbenchView} from '@scion/workbench-client';

/**
 * Allows unregistering workbench capabilities.
 */
@Component({
  selector: 'app-unregister-workbench-capability-page',
  templateUrl: './unregister-workbench-capability-page.component.html',
  styleUrls: ['./unregister-workbench-capability-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
})
export default class UnregisterWorkbenchCapabilityPageComponent {

  public form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
  });
  public unregisterError: string | undefined;
  public unregistered: boolean | undefined;

  constructor(view: WorkbenchView,
              private _manifestService: ManifestService,
              private _formBuilder: NonNullableFormBuilder) {
    view.signalReady();
  }

  public async onUnregister(): Promise<void> {
    this.unregisterError = undefined;
    this.unregistered = undefined;

    await this._manifestService.unregisterCapabilities({id: this.form.controls.id.value})
      .then(() => {
        this.unregistered = true;
        this.form.reset();
      })
      .catch(error => this.unregisterError = stringifyError(error));
  }
}
