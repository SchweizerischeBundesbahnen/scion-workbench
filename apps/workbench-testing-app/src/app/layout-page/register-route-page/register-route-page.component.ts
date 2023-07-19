/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Type} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchRouteData} from '@scion/workbench';
import {KeyValuePipe, NgFor, NgIf} from '@angular/common';
import {DefaultExport, Router, Routes} from '@angular/router';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-register-route-page',
  templateUrl: './register-route-page.component.html',
  styleUrls: ['./register-route-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    KeyValuePipe,
    SciFormFieldComponent,
  ],
})
export default class RegisterRoutePageComponent {

  public readonly componentRefs = new Map<string, () => Promise<DefaultExport<Type<unknown>>>>()
    .set('view-page', () => import('../../view-page/view-page.component'))
    .set('router-page', () => import('../../router-page/router-page.component'));

  public form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    component: this._formBuilder.control<'view-page' | 'router-page' | ''>('', Validators.required),
    outlet: this._formBuilder.control(''),
    routeData: this._formBuilder.group({
      title: this._formBuilder.control(''),
      cssClass: this._formBuilder.control(''),
    }),
  });

  constructor(private _formBuilder: NonNullableFormBuilder, private _router: Router) {
  }

  public onRegister(): void {
    this.replaceRouterConfig([
      ...this._router.config,
      {
        path: this.form.controls.path.value,
        outlet: this.form.controls.outlet.value || undefined,
        loadComponent: this.componentRefs.get(this.form.controls.component.value),
        data: {
          [WorkbenchRouteData.title]: this.form.controls.routeData.controls.title.value || undefined,
          [WorkbenchRouteData.heading]: 'Workbench E2E Testpage',
          [WorkbenchRouteData.cssClass]: this.form.controls.routeData.controls.cssClass.value.split(/\s+/).filter(Boolean),
        },
      },
    ]);

    // Perform navigation to apply the route config change.
    this._router.navigate([], {skipLocationChange: true, onSameUrlNavigation: 'reload'}).then();
    this.form.reset();
  }

  /**
   * Replaces the router configuration to install or uninstall routes at runtime.
   *
   * Same implementation as in {@link WorkbenchAuxiliaryRoutesRegistrator}.
   */
  private replaceRouterConfig(config: Routes): void {
    // Note:
    //   - Do not use Router.resetConfig(...) which would destroy any currently routed component because copying all routes
    //   - Do not assign the router a new Routes object (Router.config = ...) to allow resolution of routes added during `NavigationStart` (since Angular 7.x)
    //     (because Angular uses a reference to the Routes object during route navigation)
    const newRoutes: Routes = [...config];
    this._router.config.splice(0, this._router.config.length, ...newRoutes);
  }
}
