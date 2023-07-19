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
import {PopupSize, ViewParamDefinition, WorkbenchCapabilities, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {SciViewportComponent} from '@scion/components/viewport';
import {JsonPipe, NgIf} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

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
  ],
})
export default class RegisterWorkbenchCapabilityPageComponent {

  public form = this._formBuilder.group({
    type: this._formBuilder.control('', Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    requiredParams: this._formBuilder.control(''),
    optionalParams: this._formBuilder.control(''),
    transientParams: this._formBuilder.control(''),
    private: this._formBuilder.control(true),
    viewProperties: this._formBuilder.group({
      path: this._formBuilder.control(''),
      title: this._formBuilder.control(''),
      heading: this._formBuilder.control(''),
      closable: this._formBuilder.control(true),
      cssClass: this._formBuilder.control(''),
      pinToStartPage: this._formBuilder.control(false),
    }),
    popupProperties: this._formBuilder.group({
      path: this._formBuilder.control(''),
      size: this._formBuilder.group({
        minHeight: this._formBuilder.control(''),
        height: this._formBuilder.control(''),
        maxHeight: this._formBuilder.control(''),
        minWidth: this._formBuilder.control(''),
        width: this._formBuilder.control(''),
        maxWidth: this._formBuilder.control(''),
      }),
      pinToStartPage: this._formBuilder.control(false),
      cssClass: this._formBuilder.control(''),
    }),
  });

  public capability: Capability | undefined;
  public registerError: string | undefined;
  public WorkbenchCapabilities = WorkbenchCapabilities;

  constructor(private _manifestService: ManifestService, private _formBuilder: NonNullableFormBuilder) {
  }

  public async onRegister(): Promise<void> {
    const capability: Capability = ((): Capability => {
      switch (this.form.controls.type.value) {
        case WorkbenchCapabilities.View:
          return this.readViewCapabilityFromUI();
        case WorkbenchCapabilities.Popup:
          return this.readPopupCapabilityFromUI();
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

  private readViewCapabilityFromUI(): WorkbenchViewCapability & { properties: { pinToStartPage: boolean } } {
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
      properties: {
        path: this.readPathFromUI(this.form.controls.viewProperties.controls.path.value)!,
        title: this.form.controls.viewProperties.controls.title.value || undefined,
        heading: this.form.controls.viewProperties.controls.heading.value || undefined,
        cssClass: this.form.controls.viewProperties.controls.cssClass.value.split(/\s+/).filter(Boolean),
        closable: this.form.controls.viewProperties.controls.closable.value ?? undefined,
        pinToStartPage: this.form.controls.viewProperties.controls.pinToStartPage.value,
      },
    };
  }

  private readPopupCapabilityFromUI(): WorkbenchPopupCapability & { properties: { pinToStartPage: boolean } } {
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
      properties: {
        path: this.readPathFromUI(this.form.controls.popupProperties.controls.path.value)!,
        size: undefinedIfEmpty<PopupSize>({
          width: this.form.controls.popupProperties.controls.size.controls.width.value || undefined,
          height: this.form.controls.popupProperties.controls.size.controls.height.value || undefined,
          minWidth: this.form.controls.popupProperties.controls.size.controls.minWidth.value || undefined,
          maxWidth: this.form.controls.popupProperties.controls.size.controls.maxWidth.value || undefined,
          minHeight: this.form.controls.popupProperties.controls.size.controls.minHeight.value || undefined,
          maxHeight: this.form.controls.popupProperties.controls.size.controls.maxHeight.value || undefined,
        }),
        pinToStartPage: this.form.controls.popupProperties.controls.pinToStartPage.value,
        cssClass: this.form.controls.popupProperties.controls.cssClass.value.split(/\s+/).filter(Boolean),
      },
    };
  }

  private readPathFromUI(path: string): string | null | undefined {
    switch (path) {
      case '<null>':
        return null;
      case '<undefined>':
        return undefined;
      case '<empty>':
        return '';
      default:
        return path;
    }
  }
}
