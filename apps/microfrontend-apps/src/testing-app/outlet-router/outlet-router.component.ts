/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Beans, NavigationOptions, OutletRouter } from '@scion/microfrontend-platform';
import { SciParamsEnterComponent } from '@scion/ɵtoolkit/widgets';

export const OUTLET = 'outlet';
export const URL = 'url';
export const PARAMS = 'params';

@Component({
  selector: 'app-outlet-router',
  templateUrl: './outlet-router.component.html',
  styleUrls: ['./outlet-router.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutletRouterComponent {

  public OUTLET = OUTLET;
  public URL = URL;
  public PARAMS = PARAMS;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      [OUTLET]: new FormControl(''), // empty to navigate the primary outlet
      [URL]: new FormControl(''), // empty to clear the outlet content
      [PARAMS]: formBuilder.array([]),
    });
  }

  public onNavigateClick(): boolean {
    const url = this.form.get(URL).value;
    const options: NavigationOptions = {
      outlet: this.form.get(OUTLET).value || undefined,
      params: SciParamsEnterComponent.toParamsMap(this.form.get(PARAMS) as FormArray),
    };
    Beans.get(OutletRouter).navigate(url ? url : null, options).then();
    this.form.reset();
    this.form.setControl(PARAMS, new FormArray([]));
    return false;
  }
}
