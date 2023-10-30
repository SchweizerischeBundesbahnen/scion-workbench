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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {Capability, ManifestService, ParamDefinition} from '@scion/microfrontend-platform';
import {ViewParamDefinition, WorkbenchCapabilities, WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability, WorkbenchPopupCapability, WorkbenchView, WorkbenchViewCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {SciViewportComponent} from '@scion/components/viewport';
import {JsonPipe, NgIf} from '@angular/common';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {PerspectiveCapabilityPropertiesComponent, WorkbenchPerspectiveCapabilityProperties} from './perspective-capability-properties/perspective-capability-properties.component';
import {PerspectiveExtensionCapabilityPropertiesComponent, WorkbenchPerspectiveExtensionCapabilityProperties} from './perspective-extension-capability-properties/perspective-extension-capability-properties.component';
import {PopupCapabilityPropertiesComponent, WorkbenchPopupCapabilityProperties} from './popup-capability-properties/popup-capability-properties.component';
import {ViewCapabilityPropertiesComponent, WorkbenchViewCapabilityProperties} from './view-capability-properties/view-capability-properties.component';
import {stringifyError} from '../common/stringify-error.util';

/**
 * Allows registering workbench capabilities.
 */
@Component({
  selector: 'app-register-workbench-capability-page',
  templateUrl: './register-workbench-capability-page.component.html',
  styleUrls: ['./register-workbench-capability-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    JsonPipe,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    SciViewportComponent,
    ViewCapabilityPropertiesComponent,
    PopupCapabilityPropertiesComponent,
    PerspectiveCapabilityPropertiesComponent,
    PerspectiveExtensionCapabilityPropertiesComponent,
  ],
})
export default class RegisterWorkbenchCapabilityPageComponent {

  public form = this._formBuilder.group({
    type: this._formBuilder.control<WorkbenchCapabilities.View | WorkbenchCapabilities.Popup | WorkbenchCapabilities.Perspective | WorkbenchCapabilities.PerspectiveExtension>(WorkbenchCapabilities.View, Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    requiredParams: this._formBuilder.control(''),
    optionalParams: this._formBuilder.control(''),
    transientParams: this._formBuilder.control(''),
    private: this._formBuilder.control(true),
    viewProperties: this._formBuilder.control<WorkbenchViewCapabilityProperties | undefined>(undefined),
    popupProperties: this._formBuilder.control<WorkbenchPopupCapabilityProperties | undefined>(undefined),
    perspectiveProperties: this._formBuilder.control<WorkbenchPerspectiveCapabilityProperties | undefined>(undefined),
    perspectiveExtensionProperties: this._formBuilder.control<WorkbenchPerspectiveExtensionCapabilityProperties | undefined>(undefined),
  });

  public capability: Capability | undefined;
  public registerError: string | undefined;
  public WorkbenchCapabilities = WorkbenchCapabilities;

  constructor(view: WorkbenchView,
              private _manifestService: ManifestService,
              private _formBuilder: NonNullableFormBuilder) {
    view.signalReady();
  }

  public async onRegister(): Promise<void> {
    const capability: Capability = ((): Capability => {
      switch (this.form.controls.type.value) {
        case WorkbenchCapabilities.View:
          return this.readViewCapabilityFromUI();
        case WorkbenchCapabilities.Popup:
          return this.readPopupCapabilityFromUI();
        case WorkbenchCapabilities.Perspective:
          return this.readPerspectiveCapabilityFromUI();
        case WorkbenchCapabilities.PerspectiveExtension:
          return this.readPerspectiveExtensionCapabilityFromUI();
        default:
          throw Error('[IllegalArgumentError] Capability expected to be a workbench capability, but was not.');
      }
    })();

    this.capability = undefined;
    this.registerError = undefined;

    await this._manifestService.registerCapability(capability)
      .then(async id => {
        this.capability = (await firstValueFrom(this._manifestService.lookupCapabilities$({id})))[0];
        this.form.reset();
        this.form.setControl('qualifier', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
      })
      .catch(error => this.registerError = stringifyError(error));
  }

  private readViewCapabilityFromUI(): WorkbenchViewCapability & {properties: {pinToStartPage: boolean}} {
    const requiredParams: ViewParamDefinition[] = this.form.controls.requiredParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ViewParamDefinition[] = this.form.controls.optionalParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    const transientParams: ViewParamDefinition[] = this.form.controls.transientParams.value?.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false, transient: true}));
    return {
      type: WorkbenchCapabilities.View,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!,
      params: [
        ...requiredParams,
        ...optionalParams,
        ...transientParams,
      ],
      private: this.form.controls.private.value,
      properties: this.form.controls.viewProperties.value!,
    };
  }

  private readPopupCapabilityFromUI(): WorkbenchPopupCapability & {properties: {pinToStartPage: boolean}} {
    const requiredParams: ParamDefinition[] = this.form.controls.requiredParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ParamDefinition[] = this.form.controls.optionalParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    return {
      type: WorkbenchCapabilities.Popup,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!,
      params: [
        ...requiredParams,
        ...optionalParams,
      ],
      private: this.form.controls.private.value,
      properties: this.form.controls.popupProperties.value!,
    };
  }

  private readPerspectiveCapabilityFromUI(): WorkbenchPerspectiveCapability {
    const requiredParams: ParamDefinition[] = this.form.controls.requiredParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ParamDefinition[] = this.form.controls.optionalParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    return {
      type: WorkbenchCapabilities.Perspective,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!,
      params: [
        ...requiredParams,
        ...optionalParams,
      ],
      private: this.form.controls.private.value,
      properties: this.form.controls.perspectiveProperties.value!,
    };
  }

  private readPerspectiveExtensionCapabilityFromUI(): WorkbenchPerspectiveExtensionCapability {
    const requiredParams: ParamDefinition[] = this.form.controls.requiredParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ParamDefinition[] = this.form.controls.optionalParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    return {
      type: WorkbenchCapabilities.PerspectiveExtension,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!,
      params: [
        ...requiredParams,
        ...optionalParams,
      ],
      private: this.form.controls.private.value,
      properties: this.form.controls.perspectiveExtensionProperties.value!,
    };
  }
}
