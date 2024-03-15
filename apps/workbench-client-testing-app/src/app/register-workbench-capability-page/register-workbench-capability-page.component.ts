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
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {Capability, ManifestService, ParamDefinition} from '@scion/microfrontend-platform';
import {PopupSize, ViewParamDefinition, WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchDialogSize, WorkbenchMessageBoxCapability, WorkbenchMessageBoxSize, WorkbenchPopupCapability, WorkbenchView, WorkbenchViewCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {SciViewportComponent} from '@scion/components/viewport';
import {JsonPipe} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {parseTypedString} from '../common/parse-typed-value.util';
import {CssClassComponent} from '../css-class/css-class.component';

/**
 * Allows registering workbench capabilities.
 */
@Component({
  selector: 'app-register-workbench-capability-page',
  templateUrl: './register-workbench-capability-page.component.html',
  styleUrls: ['./register-workbench-capability-page.component.scss'],
  standalone: true,
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    SciViewportComponent,
    CssClassComponent,
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
      closable: this._formBuilder.control<boolean | null>(null),
      showSplash: this._formBuilder.control<boolean | null>(null),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
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
      showSplash: this._formBuilder.control<boolean | null>(null),
      pinToStartPage: this._formBuilder.control(false),
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
      properties: {
        path: parseTypedString(this.form.controls.viewProperties.controls.path.value), // allow `undefined` to test capability validation
        title: this.form.controls.viewProperties.controls.title.value || undefined,
        heading: this.form.controls.viewProperties.controls.heading.value || undefined,
        cssClass: this.form.controls.viewProperties.controls.cssClass.value,
        closable: this.form.controls.viewProperties.controls.closable.value ?? undefined,
        showSplash: this.form.controls.viewProperties.controls.showSplash.value ?? undefined,
        pinToStartPage: this.form.controls.viewProperties.controls.pinToStartPage.value,
      },
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
      properties: {
        path: parseTypedString(this.form.controls.popupProperties.controls.path.value), // allow `undefined` to test capability validation
        size: undefinedIfEmpty<PopupSize>({
          width: this.form.controls.popupProperties.controls.size.controls.width.value || undefined,
          height: this.form.controls.popupProperties.controls.size.controls.height.value || undefined,
          minWidth: this.form.controls.popupProperties.controls.size.controls.minWidth.value || undefined,
          maxWidth: this.form.controls.popupProperties.controls.size.controls.maxWidth.value || undefined,
          minHeight: this.form.controls.popupProperties.controls.size.controls.minHeight.value || undefined,
          maxHeight: this.form.controls.popupProperties.controls.size.controls.maxHeight.value || undefined,
        }),
        showSplash: this.form.controls.popupProperties.controls.showSplash.value ?? undefined,
        pinToStartPage: this.form.controls.popupProperties.controls.pinToStartPage.value,
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
        path: parseTypedString(this.form.controls.dialogProperties.controls.path.value), // allow `undefined` to test capability validation
        size: undefinedIfEmpty<WorkbenchDialogSize>({
          width: parseTypedString(this.form.controls.dialogProperties.controls.size.controls.width.value)!, // allow `undefined` to test capability validation
          height: parseTypedString(this.form.controls.dialogProperties.controls.size.controls.height.value)!, // allow `undefined` to test capability validation
          minWidth: this.form.controls.dialogProperties.controls.size.controls.minWidth.value || undefined,
          maxWidth: this.form.controls.dialogProperties.controls.size.controls.maxWidth.value || undefined,
          minHeight: this.form.controls.dialogProperties.controls.size.controls.minHeight.value || undefined,
          maxHeight: this.form.controls.dialogProperties.controls.size.controls.maxHeight.value || undefined,
        })!, // allow `undefined` to test capability validation
        title: this.form.controls.dialogProperties.controls.title.value || undefined,
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
