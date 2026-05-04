/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ManifestService} from '@scion/microfrontend-platform';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WORKBENCH_ELEMENT, WorkbenchElement} from '@scion/workbench-client';
import {stringifyError} from 'workbench-testing-app-common';
import {Beans} from '@scion/toolkit/bean-manager';

/**
 * Allows unregistering workbench capabilities.
 */
@Component({
  selector: 'app-unregister-workbench-capability-page',
  templateUrl: './unregister-workbench-capability-page.component.html',
  styleUrls: ['./unregister-workbench-capability-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnregisterWorkbenchCapabilityPageComponent {

  private readonly _manifestService = inject(ManifestService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
  });

  protected unregisterError = signal<string | undefined>(undefined);
  protected unregistered = signal<boolean | undefined>(undefined);

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();
  }

  protected async onUnregister(): Promise<void> {
    this.unregisterError.set(undefined);
    this.unregistered.set(undefined);

    await this._manifestService.unregisterCapabilities({id: this.form.controls.id.value})
      .then(() => {
        this.unregistered.set(true);
        this.form.reset();
      })
      .catch((error: unknown) => this.unregisterError.set(stringifyError(error)));
  }
}
