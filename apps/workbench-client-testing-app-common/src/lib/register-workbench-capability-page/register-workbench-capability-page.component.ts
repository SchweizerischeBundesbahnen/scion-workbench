/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {Capability, ManifestService, ParamDefinition} from '@scion/microfrontend-platform';
import {WORKBENCH_ELEMENT, WorkbenchCapabilities, WorkbenchElement} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {SciViewportComponent} from '@scion/components/viewport';
import {JsonPipe} from '@angular/common';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {PerspectiveCapabilityPropertiesComponent, WorkbenchPerspectiveCapabilityProperties} from './perspective-capability-properties/perspective-capability-properties.component';
import {PartCapabilityPropertiesComponent, WorkbenchPartCapabilityProperties} from './part-capability-properties/part-capability-properties.component';
import {ViewCapabilityPropertiesComponent, WorkbenchViewCapabilityProperties} from './view-capability-properties/view-capability-properties.component';
import {DialogCapabilityPropertiesComponent, WorkbenchDialogCapabilityProperties} from './dialog-capability-properties/dialog-capability-properties.component';
import {PopupCapabilityPropertiesComponent, WorkbenchPopupCapabilityProperties} from './popup-capability-properties/popup-capability-properties.component';
import {MessageBoxCapabilityPropertiesComponent, WorkbenchMessageBoxCapabilityProperties} from './message-box-capability-properties/message-box-capability-properties.component';
import {CapabilityParamsComponent} from './capability-params/capability-params.component';
import {stringifyError} from 'workbench-testing-app-common';
import {Beans} from '@scion/toolkit/bean-manager';

/**
 * Allows registering workbench capabilities.
 */
@Component({
  selector: 'app-register-workbench-capability-page',
  templateUrl: './register-workbench-capability-page.component.html',
  styleUrl: './register-workbench-capability-page.component.scss',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    SciViewportComponent,
    PerspectiveCapabilityPropertiesComponent,
    PartCapabilityPropertiesComponent,
    ViewCapabilityPropertiesComponent,
    DialogCapabilityPropertiesComponent,
    PopupCapabilityPropertiesComponent,
    MessageBoxCapabilityPropertiesComponent,
    CapabilityParamsComponent,
  ],
})
export class RegisterWorkbenchCapabilityPageComponent {

  private readonly _manifestService = inject(ManifestService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    type: this._formBuilder.control<WorkbenchCapabilities | ''>('', Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    params: this._formBuilder.control<ParamDefinition[] | undefined>(undefined),
    private: this._formBuilder.control(true),
    perspectiveProperties: this._formBuilder.control<WorkbenchPerspectiveCapabilityProperties | undefined>(undefined),
    partProperties: this._formBuilder.control<WorkbenchPartCapabilityProperties | undefined>(undefined),
    viewProperties: this._formBuilder.control<WorkbenchViewCapabilityProperties | undefined>(undefined),
    popupProperties: this._formBuilder.control<WorkbenchPopupCapabilityProperties | undefined>(undefined),
    dialogProperties: this._formBuilder.control<WorkbenchDialogCapabilityProperties | undefined>(undefined),
    messageBoxProperties: this._formBuilder.control<WorkbenchMessageBoxCapabilityProperties | undefined>(undefined),
  });

  protected readonly WorkbenchCapabilities = WorkbenchCapabilities;

  protected capability: Capability | undefined;
  protected registerError: string | undefined;

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();
  }

  public async onRegister(): Promise<void> {
    const capability: Partial<Capability> = { // Partial to test capability validation
      type: this.form.controls.type.value,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier) ?? undefined,
      params: this.form.controls.params.value,
      private: this.form.controls.private.value,
      properties: (() => {
        switch (this.form.controls.type.value) {
          case WorkbenchCapabilities.Perspective:
            return this.form.controls.perspectiveProperties.value;
          case WorkbenchCapabilities.Part:
            return this.form.controls.partProperties.value;
          case WorkbenchCapabilities.View:
            return this.form.controls.viewProperties.value;
          case WorkbenchCapabilities.Popup:
            return this.form.controls.popupProperties.value;
          case WorkbenchCapabilities.Dialog:
            return this.form.controls.dialogProperties.value;
          case WorkbenchCapabilities.MessageBox:
            return this.form.controls.messageBoxProperties.value;
          case WorkbenchCapabilities.Notification:
            return {};
          default:
            throw Error('Capability expected to be a workbench capability, but was not.');
        }
      })() ?? undefined,
    };

    this.capability = undefined;
    this.registerError = undefined;

    await this._manifestService.registerCapability(capability as Capability)
      .then(async id => {
        this.capability = id ? (await firstValueFrom(this._manifestService.lookupCapabilities$({id})))[0] : undefined;
        this.form.reset();
        this.form.setControl('qualifier', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
      })
      .catch((error: unknown) => this.registerError = stringifyError(error));
  }
}
