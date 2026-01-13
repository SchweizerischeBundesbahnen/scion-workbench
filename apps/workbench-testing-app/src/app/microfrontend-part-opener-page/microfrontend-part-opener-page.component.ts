/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, signal} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchRouter} from '@scion/workbench';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {ManifestService} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPartCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {Objects, parseTypedObject, stringifyError, throwError} from 'workbench-testing-app-common';

@Component({
  selector: 'app-microfrontend-part-opener-page',
  templateUrl: './microfrontend-part-opener-page.component.html',
  styleUrl: './microfrontend-part-opener-page.component.scss',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class MicrofrontendPartOpenerPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _manifestService = inject(ManifestService);
  private readonly _router = inject(WorkbenchRouter);
  protected readonly addPartError = signal<string | undefined>(undefined);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([
      this._formBuilder.group({
        key: this._formBuilder.control('component'),
        value: this._formBuilder.control('part'),
      }),
      this._formBuilder.group({
        key: this._formBuilder.control('app'),
        value: this._formBuilder.control('host'),
      }),
    ], Validators.required),
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    dockTo: this._formBuilder.control<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'>('left-top'),
    icon: this._formBuilder.control(''),
    label: this._formBuilder.control(''),
  });

  protected async onAddPart(): Promise<void> {
    const partId = UUID.randomUUID();
    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    const params = parseTypedObject(SciKeyValueFieldComponent.toDictionary(this.form.controls.params));
    const dockTo = this.form.controls.dockTo.value;

    try {
      const partCapability = (await firstValueFrom(this._manifestService.lookupCapabilities$<WorkbenchPartCapability>({type: WorkbenchCapabilities.Part, qualifier})))[0] ?? throwError(`Part capability {${Objects.toMatrixNotation(qualifier)}} not found.`);
      const icon = this.form.controls.icon.value || partCapability.properties!.extras!.icon;
      const label = this.form.controls.label.value || partCapability.properties!.extras!.label;

      await this._router.navigate(layout => layout
        .addPart(partId, {dockTo}, {icon, label, activate: true})
        .navigatePart(partId, [], {
          hint: 'scion.workbench.microfrontend-part',
          data: {
            capabilityId: partCapability.metadata!.id,
            params: params ?? {},
            referrer: partCapability.metadata!.appSymbolicName,
          },
        }),
      );
    }
    catch (error) {
      this.addPartError.set(stringifyError(error));
    }
  }
}
