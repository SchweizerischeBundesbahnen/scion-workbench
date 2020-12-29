/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SciParamsEnterComponent } from '@scion/toolkit.internal/widgets';
import { Capability, ManifestService } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities, WorkbenchViewCapability } from '@scion/workbench-client';

const TYPE = 'type';
const QUALIFIER = 'qualifier';
const REQUIRED_PARAMS = 'requiredParams';
const OPTIONAL_PARAMS = 'optionalParams';
const VIEW_PROPERTIES = 'viewProperties';
const PRIVATE = 'private';
const PATH = 'path';
const TITLE = 'title';
const HEADING = 'heading';
const CLOSABLE = 'closable';
const CSS_CLASS = 'cssClass';
const PIN_TO_START_PAGE = 'pinToStartPage';

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
  public readonly PRIVATE = PRIVATE;
  public readonly VIEW_PROPERTIES = VIEW_PROPERTIES;
  public readonly PATH = PATH;
  public readonly TITLE = TITLE;
  public readonly HEADING = HEADING;
  public readonly CLOSABLE = CLOSABLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly PIN_TO_START_PAGE = PIN_TO_START_PAGE;

  public form: FormGroup;

  public capabilityId: string;
  public registerError: string;
  public WorkbenchCapabilities = WorkbenchCapabilities;

  private _formInitialValue: any;

  constructor(formBuilder: FormBuilder,
              private _manifestService: ManifestService) {
    this.form = formBuilder.group({
      [TYPE]: formBuilder.control('', Validators.required),
      [QUALIFIER]: formBuilder.array([], Validators.required),
      [REQUIRED_PARAMS]: formBuilder.control(''),
      [OPTIONAL_PARAMS]: formBuilder.control(''),
      [PRIVATE]: formBuilder.control(true),
      [VIEW_PROPERTIES]: formBuilder.group({
        [PATH]: formBuilder.control(''),
        [TITLE]: formBuilder.control(''),
        [HEADING]: formBuilder.control(''),
        [CLOSABLE]: formBuilder.control(true),
        [CSS_CLASS]: formBuilder.control(''),
        [PIN_TO_START_PAGE]: formBuilder.control(false),
      }),
    });
    this._formInitialValue = this.form.value;
  }

  public async onRegister(): Promise<void> {
    const capability: Capability = ((): Capability => {
      switch (this.form.get(TYPE).value) {
        case WorkbenchCapabilities.View:
          return this.readViewCapabilityFromUI();
        default:
          throw Error('[IllegalArgumentError] Capability expected to be a workbench capability, but was not.');
      }
    })();

    this.capabilityId = null;
    this.registerError = null;

    await this._manifestService.registerCapability(capability)
      .then(id => {
        this.capabilityId = id;
        this.form.reset(this._formInitialValue);
        this.form.setControl(QUALIFIER, new FormArray([]));
      })
      .catch(error => this.registerError = error);
  }

  private readViewCapabilityFromUI(): WorkbenchViewCapability & { properties: { pinToStartPage: boolean } } {
    const propertiesGroup = this.form.get(VIEW_PROPERTIES);
    return {
      type: WorkbenchCapabilities.View,
      qualifier: SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as FormArray),
      requiredParams: this.form.get(REQUIRED_PARAMS).value?.split(/,\s*/).filter(Boolean),
      optionalParams: this.form.get(OPTIONAL_PARAMS).value?.split(/,\s*/).filter(Boolean),
      private: this.form.get(PRIVATE).value,
      properties: {
        path: this.readPathFromUI(propertiesGroup),
        title: propertiesGroup.get(TITLE).value || undefined,
        heading: propertiesGroup.get(HEADING).value || undefined,
        cssClass: propertiesGroup.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || undefined,
        closable: propertiesGroup.get(CLOSABLE).value ?? undefined,
        pinToStartPage: propertiesGroup.get(PIN_TO_START_PAGE).value,
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
