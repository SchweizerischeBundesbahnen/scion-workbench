/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {WbNavigationExtras, WorkbenchRouter, WorkbenchView} from '@scion/workbench';
import {ActivatedRoute, Params, PRIMARY_OUTLET, Router, Routes} from '@angular/router';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {SciParamsEnterComponent} from '@scion/toolkit.internal/widgets';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

const PATH = 'path';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';
const NAVIGATIONAL_STATE = 'navigationalState';
const TARGET = 'target';
const INSERTION_INDEX = 'insertionIndex';
const SELF_VIEW_ID = 'selfViewId';
const ACTIVATE_IF_PRESENT = 'activateIfPresent';
const CLOSE_IF_PRESENT = 'closeIfPresent';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
})
export class RouterPageComponent {

  public readonly PATH = PATH;
  public readonly MATRIX_PARAMS = MATRIX_PARAMS;
  public readonly NAVIGATIONAL_STATE = NAVIGATIONAL_STATE;
  public readonly TARGET = TARGET;
  public readonly SELF_VIEW_ID = SELF_VIEW_ID;
  public readonly INSERTION_INDEX = INSERTION_INDEX;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly ACTIVATE_IF_PRESENT = ACTIVATE_IF_PRESENT;
  public readonly CLOSE_IF_PRESENT = CLOSE_IF_PRESENT;

  public form: FormGroup;
  public navigateError: string;

  public routerLinkCommands$: Observable<any[]>;
  public navigationExtras$: Observable<WbNavigationExtras>;
  public routes: Routes;

  constructor(formBuilder: FormBuilder,
              route: ActivatedRoute,
              view: WorkbenchView,
              private _router: Router,
              private _wbRouter: WorkbenchRouter) {
    view.title = route.snapshot.data['title'];
    view.heading = route.snapshot.data['heading'];
    view.cssClass = route.snapshot.data['cssClass'];

    this.form = formBuilder.group({
      [PATH]: formBuilder.control(''),
      [MATRIX_PARAMS]: formBuilder.array([]),
      [NAVIGATIONAL_STATE]: formBuilder.array([]),
      [TARGET]: formBuilder.control(''),
      [SELF_VIEW_ID]: formBuilder.control(view.viewId),
      [INSERTION_INDEX]: formBuilder.control(''),
      [QUERY_PARAMS]: formBuilder.array([]),
      [ACTIVATE_IF_PRESENT]: formBuilder.control(undefined),
      [CLOSE_IF_PRESENT]: formBuilder.control(undefined),
    });

    this.routerLinkCommands$ = this.form.valueChanges
      .pipe(
        map(() => this.constructRouterLinkCommands()),
        startWith(this.constructRouterLinkCommands()),
      );

    this.navigationExtras$ = this.form.valueChanges
      .pipe(
        map(() => this.constructNavigationExtras()),
        startWith(this.constructNavigationExtras()),
      );

    this.routes = this._router.config
      .filter(it => !it.outlet || it.outlet === PRIMARY_OUTLET)
      .filter(it => !it.path.startsWith('~')); // microfrontend route prefix
  }

  public onRouterNavigate(): void {
    this.navigateError = null;
    const commands: any[] = this.constructRouterLinkCommands();
    const extras: WbNavigationExtras = this.constructNavigationExtras();

    this._wbRouter.navigate(commands, extras)
      .catch(error => this.navigateError = error);
  }

  private constructRouterLinkCommands(): any[] {
    const matrixParams: Params | null = SciParamsEnterComponent.toParamsDictionary(this.form.get(MATRIX_PARAMS) as FormArray);
    const commands: any[] = this.form.get(PATH).value.split('/');

    // Replace the first segment with a slash if empty
    if (commands[0] === '') {
      commands[0] = '/';
    }

    return commands.concat(matrixParams ? matrixParams : []);
  }

  private constructNavigationExtras(): WbNavigationExtras {
    return {
      queryParams: SciParamsEnterComponent.toParamsDictionary(this.form.get(QUERY_PARAMS) as FormArray),
      activateIfPresent: this.form.get(ACTIVATE_IF_PRESENT).value,
      closeIfPresent: this.form.get(CLOSE_IF_PRESENT).value,
      target: this.form.get(TARGET).value || undefined,
      selfViewId: this.form.get(SELF_VIEW_ID).value || undefined,
      blankInsertionIndex: coerceInsertionIndex(this.form.get(INSERTION_INDEX).value),
      state: SciParamsEnterComponent.toParamsDictionary(this.form.get(NAVIGATIONAL_STATE) as FormArray),
    };
  }
}

function coerceInsertionIndex(value: any): number | 'start' | 'end' | undefined {
  if (value === '') {
    return undefined;
  }
  if (value === 'start' || value === 'end' || value === undefined) {
    return value;
  }
  return coerceNumberProperty(value);
}
