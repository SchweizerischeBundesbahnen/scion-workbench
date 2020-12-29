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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManifestService } from '@scion/microfrontend-platform';

const ID = 'id';

/**
 * Allows unregistering workbench capabilities.
 */
@Component({
  selector: 'app-unregister-workbench-capability-page',
  templateUrl: './unregister-workbench-capability-page.component.html',
  styleUrls: ['./unregister-workbench-capability-page.component.scss'],
})
export class UnregisterWorkbenchCapabilityPageComponent {

  public readonly ID = ID;

  public form: FormGroup;
  public unregisterError: string;
  public unregistered: boolean;

  constructor(formBuilder: FormBuilder,
              private _manifestService: ManifestService) {
    this.form = formBuilder.group({
      [ID]: formBuilder.control('', Validators.required),
    });
  }

  public async onUnregister(): Promise<void> {
    this.unregisterError = undefined;
    this.unregistered = undefined;

    await this._manifestService.unregisterCapabilities({id: this.form.get(ID).value})
      .then(() => {
        this.unregistered = true;
        this.form.reset();
      })
      .catch(error => this.unregisterError = error);
  }
}
