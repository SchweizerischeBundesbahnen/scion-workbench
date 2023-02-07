/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Injector} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {WbNavigationExtras, WorkbenchRouter, WorkbenchView} from '@scion/workbench';
import {Params, PRIMARY_OUTLET, Router, Routes} from '@angular/router';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {SciParamsEnterComponent} from '@scion/components.internal/params-enter';
import {BehaviorSubject, Observable, share} from 'rxjs';
import {map} from 'rxjs/operators';

const PATH = 'path';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';
const NAVIGATIONAL_STATE = 'navigationalState';
const TARGET = 'target';
const INSERTION_INDEX = 'insertionIndex';
const ACTIVATE = 'activate';
const CLOSE = 'close';
const CSS_CLASS = 'cssClass';
const VIEW_CONTEXT = 'viewContext';

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
  public readonly INSERTION_INDEX = INSERTION_INDEX;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly ACTIVATE = ACTIVATE;
  public readonly CLOSE = CLOSE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly VIEW_CONTEXT = VIEW_CONTEXT;

  public form: UntypedFormGroup;
  public navigateError: string;

  public routerLinkCommands$: Observable<any[]>;
  public navigationExtras$: Observable<WbNavigationExtras>;
  public routes: Routes;

  public nullViewInjector: Injector;

  constructor(formBuilder: UntypedFormBuilder,
              injector: Injector,
              private _router: Router,
              private _wbRouter: WorkbenchRouter) {
    this.form = formBuilder.group({
      [PATH]: formBuilder.control(''),
      [MATRIX_PARAMS]: formBuilder.array([]),
      [NAVIGATIONAL_STATE]: formBuilder.array([]),
      [TARGET]: formBuilder.control(''),
      [INSERTION_INDEX]: formBuilder.control(''),
      [QUERY_PARAMS]: formBuilder.array([]),
      [ACTIVATE]: formBuilder.control(undefined),
      [CLOSE]: formBuilder.control(undefined),
      [CSS_CLASS]: formBuilder.control(undefined),
      [VIEW_CONTEXT]: formBuilder.control(true),
    });

    this.routerLinkCommands$ = this.form.valueChanges
      .pipe(
        map(() => this.constructRouterLinkCommands()),
        share({connector: () => new BehaviorSubject(this.constructRouterLinkCommands())}),
      );

    this.navigationExtras$ = this.form.valueChanges
      .pipe(
        map(() => this.constructNavigationExtras()),
        share({connector: () => new BehaviorSubject(this.constructNavigationExtras())}),
      );

    this.routes = this._router.config
      .filter(it => !it.outlet || it.outlet === PRIMARY_OUTLET)
      .filter(it => !it.path.startsWith('~')); // microfrontend route prefix

    this.nullViewInjector = Injector.create({
      parent: injector,
      providers: [
        {provide: WorkbenchView, useValue: undefined},
      ],
    });
  }

  public onRouterNavigate(): void {
    this.navigateError = null;
    const commands: any[] = this.constructRouterLinkCommands();
    const extras: WbNavigationExtras = this.constructNavigationExtras();

    this._wbRouter.navigate(commands, extras)
      .catch(error => this.navigateError = error);
  }

  private constructRouterLinkCommands(): any[] {
    const matrixParams: Params | null = SciParamsEnterComponent.toParamsDictionary(this.form.get(MATRIX_PARAMS) as UntypedFormArray);
    const path = this.form.get(PATH).value;
    const commands: any[] = path === '<empty>' ? [] : path.split('/');

    // When tokenizing the path into segments, an empty segment is created for the leading slash (if any).
    if (path.startsWith('/')) {
      commands[0] = '/';
    }

    return commands.concat(matrixParams ? matrixParams : []);
  }

  private constructNavigationExtras(): WbNavigationExtras {
    return {
      queryParams: SciParamsEnterComponent.toParamsDictionary(this.form.get(QUERY_PARAMS) as UntypedFormArray),
      activate: this.form.get(ACTIVATE).value,
      close: this.form.get(CLOSE).value,
      target: this.form.get(TARGET).value || undefined,
      blankInsertionIndex: coerceInsertionIndex(this.form.get(INSERTION_INDEX).value),
      state: SciParamsEnterComponent.toParamsDictionary(this.form.get(NAVIGATIONAL_STATE) as UntypedFormArray),
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
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
