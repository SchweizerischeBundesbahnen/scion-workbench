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
import {PopupSize, ViewParamDefinition, WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchDialogSize, WorkbenchMessageBoxCapability, WorkbenchMessageBoxSize, WorkbenchPerspectiveCapability, WorkbenchPopupCapability, WorkbenchView, WorkbenchViewCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {SciViewportComponent} from '@scion/components/viewport';
import {JsonPipe} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {parseTypedString} from '../common/parse-typed-value.util';
import {PerspectiveCapabilityPropertiesComponent, WorkbenchPerspectiveCapabilityProperties} from './perspective-capability-properties/perspective-capability-properties.component';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import {RecordComponent} from '../record/record.component';

/**
 * Allows registering workbench capabilities.
 */
@Component({
  selector: 'app-register-workbench-capability-page',
  templateUrl: './register-workbench-capability-page.component.html',
  styleUrls: ['./register-workbench-capability-page.component.scss'],
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    SciViewportComponent,
    PerspectiveCapabilityPropertiesComponent,
    MultiValueInputComponent,
    RecordComponent,
  ],
})
export default class RegisterWorkbenchCapabilityPageComponent {

  private readonly _manifestService = inject(ManifestService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    type: this._formBuilder.control<WorkbenchCapabilities | ''>('', Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    requiredParams: this._formBuilder.control(''),
    optionalParams: this._formBuilder.control(''),
    transientParams: this._formBuilder.control(''),
    private: this._formBuilder.control(true),
    perspectiveProperties: this._formBuilder.control<WorkbenchPerspectiveCapabilityProperties | undefined>(undefined),
    viewProperties: this._formBuilder.group({
      path: this._formBuilder.control(''),
      title: this._formBuilder.control(''),
      heading: this._formBuilder.control(''),
      resolve: this._formBuilder.control<Record<string, string> | undefined>(undefined),
      lazy: this._formBuilder.control<boolean | null>(null),
      closable: this._formBuilder.control<boolean | null>(null),
      showSplash: this._formBuilder.control<boolean | null>(null),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
      pinToDesktop: this._formBuilder.control(false),
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
      showSplash: this._formBuilder.control<boolean | null>(null),
      pinToDesktop: this._formBuilder.control(false),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
    dialogProperties: this._formBuilder.group({
      path: this._formBuilder.control(''),
      size: this._formBuilder.group({
        minHeight: this._formBuilder.control(''),
        height: this._formBuilder.control(''),
        maxHeight: this._formBuilder.control(''),
        minWidth: this._formBuilder.control(''),
        width: this._formBuilder.control(''),
        maxWidth: this._formBuilder.control(''),
      }),
      title: this._formBuilder.control(''),
      resolve: this._formBuilder.control<Record<string, string> | undefined>(undefined),
      closable: this._formBuilder.control<boolean | null>(null),
      resizable: this._formBuilder.control<boolean | null>(null),
      padding: this._formBuilder.control<boolean | null>(null),
      showSplash: this._formBuilder.control<boolean | null>(null),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
    messageBoxProperties: this._formBuilder.group({
      path: this._formBuilder.control(''),
      size: this._formBuilder.group({
        minHeight: this._formBuilder.control(''),
        height: this._formBuilder.control(''),
        maxHeight: this._formBuilder.control(''),
        minWidth: this._formBuilder.control(''),
        width: this._formBuilder.control(''),
        maxWidth: this._formBuilder.control(''),
      }),
      showSplash: this._formBuilder.control(false),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
  });

  protected readonly WorkbenchCapabilities = WorkbenchCapabilities;

  protected capability: Capability | undefined;
  protected registerError: string | undefined;

  constructor() {
    inject(WorkbenchView).signalReady();
  }

  public async onRegister(): Promise<void> {
    const capability: Capability = ((): Capability => {
      switch (this.form.controls.type.value) {
        case WorkbenchCapabilities.Perspective:
          return this.readPerspectiveCapabilityFromUI();
        case WorkbenchCapabilities.View:
          return this.readViewCapabilityFromUI();
        case WorkbenchCapabilities.Popup:
          return this.readPopupCapabilityFromUI();
        case WorkbenchCapabilities.Dialog:
          return this.readDialogCapabilityFromUI();
        case WorkbenchCapabilities.MessageBox:
          return this.readMessageBoxCapabilityFromUI();
        default:
          throw Error('Capability expected to be a workbench capability, but was not.');
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
      .catch((error: unknown) => this.registerError = stringifyError(error));
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

  private readViewCapabilityFromUI(): WorkbenchViewCapability & {properties: {pinToDesktop: boolean}} {
    const requiredParams: ViewParamDefinition[] = this.form.controls.requiredParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ViewParamDefinition[] = this.form.controls.optionalParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    const transientParams: ViewParamDefinition[] = this.form.controls.transientParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false, transient: true}));
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
        path: parseTypedString(this.form.controls.viewProperties.controls.path.value)!, // allow `undefined` to test capability validation
        title: this.form.controls.viewProperties.controls.title.value || undefined,
        heading: this.form.controls.viewProperties.controls.heading.value || undefined,
        resolve: this.form.controls.viewProperties.controls.resolve.value,
        lazy: this.form.controls.viewProperties.controls.lazy.value ?? undefined,
        cssClass: this.form.controls.viewProperties.controls.cssClass.value,
        closable: this.form.controls.viewProperties.controls.closable.value ?? undefined,
        showSplash: this.form.controls.viewProperties.controls.showSplash.value ?? undefined,
        pinToDesktop: this.form.controls.viewProperties.controls.pinToDesktop.value,
      },
    };
  }

  private readPopupCapabilityFromUI(): WorkbenchPopupCapability & {properties: {pinToDesktop: boolean}} {
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
        path: parseTypedString(this.form.controls.popupProperties.controls.path.value)!, // allow `undefined` to test capability validation
        size: undefinedIfEmpty<PopupSize>({
          width: this.form.controls.popupProperties.controls.size.controls.width.value || undefined,
          height: this.form.controls.popupProperties.controls.size.controls.height.value || undefined,
          minWidth: this.form.controls.popupProperties.controls.size.controls.minWidth.value || undefined,
          maxWidth: this.form.controls.popupProperties.controls.size.controls.maxWidth.value || undefined,
          minHeight: this.form.controls.popupProperties.controls.size.controls.minHeight.value || undefined,
          maxHeight: this.form.controls.popupProperties.controls.size.controls.maxHeight.value || undefined,
        }),
        showSplash: this.form.controls.popupProperties.controls.showSplash.value ?? undefined,
        pinToDesktop: this.form.controls.popupProperties.controls.pinToDesktop.value,
        cssClass: this.form.controls.popupProperties.controls.cssClass.value,
      },
    };
  }

  private readDialogCapabilityFromUI(): WorkbenchDialogCapability {
    const requiredParams: ParamDefinition[] = this.form.controls.requiredParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ParamDefinition[] = this.form.controls.optionalParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    return {
      type: WorkbenchCapabilities.Dialog,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!,
      params: [
        ...requiredParams,
        ...optionalParams,
      ],
      private: this.form.controls.private.value,
      properties: {
        path: parseTypedString(this.form.controls.dialogProperties.controls.path.value)!, // allow `undefined` to test capability validation
        size: undefinedIfEmpty<WorkbenchDialogSize>({
          width: parseTypedString(this.form.controls.dialogProperties.controls.size.controls.width.value)!, // allow `undefined` to test capability validation
          height: parseTypedString(this.form.controls.dialogProperties.controls.size.controls.height.value)!, // allow `undefined` to test capability validation
          minWidth: this.form.controls.dialogProperties.controls.size.controls.minWidth.value || undefined,
          maxWidth: this.form.controls.dialogProperties.controls.size.controls.maxWidth.value || undefined,
          minHeight: this.form.controls.dialogProperties.controls.size.controls.minHeight.value || undefined,
          maxHeight: this.form.controls.dialogProperties.controls.size.controls.maxHeight.value || undefined,
        })!, // allow `undefined` to test capability validation
        title: this.form.controls.dialogProperties.controls.title.value || undefined,
        resolve: this.form.controls.dialogProperties.controls.resolve.value,
        closable: this.form.controls.dialogProperties.controls.closable.value ?? undefined,
        resizable: this.form.controls.dialogProperties.controls.resizable.value ?? undefined,
        padding: this.form.controls.dialogProperties.controls.padding.value ?? undefined,
        showSplash: this.form.controls.dialogProperties.controls.showSplash.value ?? undefined,
        cssClass: this.form.controls.dialogProperties.controls.cssClass.value,
      },
    };
  }

  private readMessageBoxCapabilityFromUI(): WorkbenchMessageBoxCapability {
    const requiredParams: ParamDefinition[] = this.form.controls.requiredParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ParamDefinition[] = this.form.controls.optionalParams.value.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    return {
      type: WorkbenchCapabilities.MessageBox,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!,
      params: [
        ...requiredParams,
        ...optionalParams,
      ],
      private: this.form.controls.private.value,
      properties: {
        path: parseTypedString(this.form.controls.messageBoxProperties.controls.path.value)!,
        size: undefinedIfEmpty<WorkbenchMessageBoxSize>({
          width: this.form.controls.messageBoxProperties.controls.size.controls.width.value || undefined,
          height: this.form.controls.messageBoxProperties.controls.size.controls.height.value || undefined,
          minWidth: this.form.controls.messageBoxProperties.controls.size.controls.minWidth.value || undefined,
          maxWidth: this.form.controls.messageBoxProperties.controls.size.controls.maxWidth.value || undefined,
          minHeight: this.form.controls.messageBoxProperties.controls.size.controls.minHeight.value || undefined,
          maxHeight: this.form.controls.messageBoxProperties.controls.size.controls.maxHeight.value || undefined,
        }),
        showSplash: this.form.controls.messageBoxProperties.controls.showSplash.value,
        cssClass: this.form.controls.messageBoxProperties.controls.cssClass.value,
      },
    };
  }
}
