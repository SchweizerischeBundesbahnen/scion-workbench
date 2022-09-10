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
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {SciParamsEnterComponent} from '@scion/components.internal/params-enter';
import {Intention, ManifestService} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';

const TYPE = 'type';
const QUALIFIER = 'qualifier';

@Component({
  selector: 'app-register-workbench-intention-page',
  templateUrl: './register-workbench-intention-page.component.html',
  styleUrls: ['./register-workbench-intention-page.component.scss'],
})
export class RegisterWorkbenchIntentionPageComponent {

  public readonly TYPE = TYPE;
  public readonly QUALIFIER = QUALIFIER;

  public form: UntypedFormGroup;

  public intentionId: string;
  public registerError: string;
  public WorkbenchCapabilities = WorkbenchCapabilities;

  constructor(formBuilder: UntypedFormBuilder, private _manifestService: ManifestService) {
    this.form = formBuilder.group({
      [TYPE]: formBuilder.control('', Validators.required),
      [QUALIFIER]: formBuilder.array([]),
    });
  }

  public async onRegister(): Promise<void> {
    const intention: Intention = {
      type: this.form.get(TYPE).value,
      qualifier: SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray),
    };

    this.intentionId = null;
    this.registerError = null;

    await this._manifestService.registerIntention(intention)
      .then(id => {
        this.intentionId = id;
        this.form.reset();
        this.form.setControl(QUALIFIER, new UntypedFormArray([]));
      })
      .catch(error => this.registerError = error);
  }
}
