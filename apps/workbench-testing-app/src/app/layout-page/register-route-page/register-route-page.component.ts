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
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchRouteData} from '@scion/workbench';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {KeyValuePipe, NgFor, NgIf} from '@angular/common';
import {DefaultExport, Router, Routes} from '@angular/router';

const PATH = 'path';
const COMPONENT = 'component';
const OUTLET = 'outlet';
const ROUTE_DATA = 'routeData';
const TITLE = 'title';
const CSS_CLASS = 'cssClass';

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
    SciFormFieldModule,
  ],
})
export default class RegisterRoutePageComponent {

  public readonly PATH = PATH;
  public readonly COMPONENT = COMPONENT;
  public readonly OUTLET = OUTLET;
  public readonly ROUTE_DATA = ROUTE_DATA;
  public readonly TITLE = TITLE;
  public readonly CSS_CLASS = CSS_CLASS;

  public readonly componentRefs = new Map<string, () => Promise<DefaultExport<Type<unknown>>>>()
    .set('view-page', () => import('../../view-page/view-page.component'))
    .set('router-page', () => import('../../router-page/router-page.component'));

  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _router: Router) {
    this.form = formBuilder.group({
      [PATH]: formBuilder.control('', {nonNullable: true}),
      [COMPONENT]: formBuilder.control(undefined, {validators: Validators.required, nonNullable: true}),
      [OUTLET]: formBuilder.control(undefined, {nonNullable: true}),
      [ROUTE_DATA]: formBuilder.group({
        [TITLE]: formBuilder.control(undefined, {nonNullable: true}),
        [CSS_CLASS]: formBuilder.control(undefined, {nonNullable: true}),
      }),
    });
  }

  public onRegister(): void {
    this.replaceRouterConfig([
      ...this._router.config,
      {
        path: this.form.get(PATH).value,
        outlet: this.form.get(OUTLET).value || undefined,
        loadComponent: this.componentRefs.get(this.form.get(COMPONENT).value),
        data: {
          [WorkbenchRouteData.title]: this.form.get([ROUTE_DATA, TITLE]).value || undefined,
          [WorkbenchRouteData.heading]: 'Workbench E2E Testpage',
          [WorkbenchRouteData.cssClass]: this.form.get([ROUTE_DATA, CSS_CLASS]).value?.split(/\s+/).filter(Boolean),
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
