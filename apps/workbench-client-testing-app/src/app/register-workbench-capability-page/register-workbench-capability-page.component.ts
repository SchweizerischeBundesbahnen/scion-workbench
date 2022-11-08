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
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {SciParamsEnterComponent} from '@scion/components.internal/params-enter';
import {Capability, ManifestService, ParamDefinition} from '@scion/microfrontend-platform';
import {PopupSize, ViewParamDefinition, WorkbenchCapabilities, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {undefinedIfEmpty} from '../util/util';
import {firstValueFrom} from 'rxjs';

const TYPE = 'type';
const QUALIFIER = 'qualifier';
const REQUIRED_PARAMS = 'requiredParams';
const OPTIONAL_PARAMS = 'optionalParams';
const TRANSIENT_PARAMS = 'transientParams';
const VIEW_PROPERTIES = 'viewProperties';
const POPUP_PROPERTIES = 'popupProperties';
const PRIVATE = 'private';
const PATH = 'path';
const TITLE = 'title';
const HEADING = 'heading';
const CLOSABLE = 'closable';
const CSS_CLASS = 'cssClass';
const PIN_TO_START_PAGE = 'pinToStartPage';
const SIZE = 'size';
const MIN_HEIGHT = 'minHeight';
const HEIGHT = 'height';
const MAX_HEIGHT = 'maxHeight';
const MIN_WIDTH = 'minWidth';
const WIDTH = 'width';
const MAX_WIDTH = 'maxWidth';

/**
 * Allows registering workbench capabilities.
 */
@Component({
  selector: 'app-register-workbench-capability-page',
  templateUrl: './register-workbench-capability-page.component.html',
  styleUrls: ['./register-workbench-capability-page.component.scss'],
})
export class RegisterWorkbenchCapabilityPageComponent {

  public readonly TYPE = TYPE;
  public readonly QUALIFIER = QUALIFIER;
  public readonly REQUIRED_PARAMS = REQUIRED_PARAMS;
  public readonly OPTIONAL_PARAMS = OPTIONAL_PARAMS;
  public readonly TRANSIENT_PARAMS = TRANSIENT_PARAMS;
  public readonly PRIVATE = PRIVATE;
  public readonly VIEW_PROPERTIES = VIEW_PROPERTIES;
  public readonly POPUP_PROPERTIES = POPUP_PROPERTIES;
  public readonly PATH = PATH;
  public readonly TITLE = TITLE;
  public readonly HEADING = HEADING;
  public readonly CLOSABLE = CLOSABLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly PIN_TO_START_PAGE = PIN_TO_START_PAGE;
  public readonly SIZE = SIZE;
  public readonly MIN_HEIGHT = MIN_HEIGHT;
  public readonly HEIGHT = HEIGHT;
  public readonly MAX_HEIGHT = MAX_HEIGHT;
  public readonly MIN_WIDTH = MIN_WIDTH;
  public readonly WIDTH = WIDTH;
  public readonly MAX_WIDTH = MAX_WIDTH;

  public form: UntypedFormGroup;

  public capability: Capability;
  public registerError: string;
  public WorkbenchCapabilities = WorkbenchCapabilities;

  private _formInitialValue: any;

  constructor(formBuilder: UntypedFormBuilder,
              private _manifestService: ManifestService) {
    this.form = formBuilder.group({
      [TYPE]: formBuilder.control('', Validators.required),
      [QUALIFIER]: formBuilder.array([]),
      [REQUIRED_PARAMS]: formBuilder.control(''),
      [OPTIONAL_PARAMS]: formBuilder.control(''),
      [TRANSIENT_PARAMS]: formBuilder.control(''),
      [PRIVATE]: formBuilder.control(true),
      [VIEW_PROPERTIES]: formBuilder.group({
        [PATH]: formBuilder.control(''),
        [TITLE]: formBuilder.control(''),
        [HEADING]: formBuilder.control(''),
        [CLOSABLE]: formBuilder.control(true),
        [CSS_CLASS]: formBuilder.control(''),
        [PIN_TO_START_PAGE]: formBuilder.control(false),
      }),
      [POPUP_PROPERTIES]: formBuilder.group({
        [PATH]: formBuilder.control(''),
        [SIZE]: formBuilder.group({
          [MIN_HEIGHT]: formBuilder.control(''),
          [HEIGHT]: formBuilder.control(''),
          [MAX_HEIGHT]: formBuilder.control(''),
          [MIN_WIDTH]: formBuilder.control(''),
          [WIDTH]: formBuilder.control(''),
          [MAX_WIDTH]: formBuilder.control(''),
        }),
        [PIN_TO_START_PAGE]: formBuilder.control(false),
        [CSS_CLASS]: formBuilder.control(''),
      }),
    });
    this._formInitialValue = this.form.value;
  }

  public async onRegister(): Promise<void> {
    const capability: Capability = ((): Capability => {
      switch (this.form.get(TYPE).value) {
        case WorkbenchCapabilities.View:
          return this.readViewCapabilityFromUI();
        case WorkbenchCapabilities.Popup:
          return this.readPopupCapabilityFromUI();
        default:
          throw Error('[IllegalArgumentError] Capability expected to be a workbench capability, but was not.');
      }
    })();

    this.capability = null;
    this.registerError = null;

    await this._manifestService.registerCapability(capability)
      .then(async id => {
        this.capability = (await firstValueFrom(this._manifestService.lookupCapabilities$({id})))[0];
        this.form.reset(this._formInitialValue);
        this.form.setControl(QUALIFIER, new UntypedFormArray([]));
      })
      .catch(error => this.registerError = error);
  }

  private readViewCapabilityFromUI(): WorkbenchViewCapability & {properties: {pinToStartPage: boolean}} {
    const propertiesGroup = this.form.get(VIEW_PROPERTIES);
    const requiredParams: ViewParamDefinition[] = this.form.get(REQUIRED_PARAMS).value?.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ViewParamDefinition[] = this.form.get(OPTIONAL_PARAMS).value?.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    const transientParams: ViewParamDefinition[] = this.form.get(TRANSIENT_PARAMS).value?.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false, transient: true}));
    return {
      type: WorkbenchCapabilities.View,
      qualifier: SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray),
      params: [
        ...requiredParams,
        ...optionalParams,
        ...transientParams,
      ],
      private: this.form.get(PRIVATE).value,
      properties: {
        path: this.readPathFromUI(propertiesGroup),
        title: propertiesGroup.get(TITLE).value || undefined,
        heading: propertiesGroup.get(HEADING).value || undefined,
        cssClass: propertiesGroup.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
        closable: propertiesGroup.get(CLOSABLE).value ?? undefined,
        pinToStartPage: propertiesGroup.get(PIN_TO_START_PAGE).value,
      },
    };
  }

  private readPopupCapabilityFromUI(): WorkbenchPopupCapability & {properties: {pinToStartPage: boolean}} {
    const propertiesGroup = this.form.get(POPUP_PROPERTIES);
    const requiredParams: ParamDefinition[] = this.form.get(REQUIRED_PARAMS).value?.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: true}));
    const optionalParams: ParamDefinition[] = this.form.get(OPTIONAL_PARAMS).value?.split(/,\s*/).filter(Boolean).map(param => ({name: param, required: false}));
    return {
      type: WorkbenchCapabilities.Popup,
      qualifier: SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray),
      params: [
        ...requiredParams,
        ...optionalParams,
      ],
      private: this.form.get(PRIVATE).value,
      properties: {
        path: this.readPathFromUI(propertiesGroup),
        size: undefinedIfEmpty<PopupSize>({
          width: propertiesGroup.get([SIZE, WIDTH]).value || undefined,
          height: propertiesGroup.get([SIZE, HEIGHT]).value || undefined,
          minWidth: propertiesGroup.get([SIZE, MIN_WIDTH]).value || undefined,
          maxWidth: propertiesGroup.get([SIZE, MAX_WIDTH]).value || undefined,
          minHeight: propertiesGroup.get([SIZE, MIN_HEIGHT]).value || undefined,
          maxHeight: propertiesGroup.get([SIZE, MAX_HEIGHT]).value || undefined,
        }),
        pinToStartPage: propertiesGroup.get(PIN_TO_START_PAGE).value,
        cssClass: propertiesGroup.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
      },
    };
  }

  private readPathFromUI(formGroup: AbstractControl): string {
    const path = formGroup.get(PATH).value;
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
