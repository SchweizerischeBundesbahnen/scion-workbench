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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {WorkbenchNavigationExtras, WorkbenchRouter, WorkbenchRouterLinkDirective, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {Params, PRIMARY_OUTLET, Router, Routes} from '@angular/router';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {BehaviorSubject, Observable, share} from 'rxjs';
import {map} from 'rxjs/operators';
import {AsyncPipe, NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AsyncPipe,
    NgTemplateOutlet,
    WorkbenchRouterLinkDirective,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
  ],
})
export default class RouterPageComponent {

  public form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    matrixParams: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    navigationalState: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    target: this._formBuilder.control(''),
    blankPartId: this._formBuilder.control(''),
    insertionIndex: this._formBuilder.control(''),
    queryParams: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    activate: this._formBuilder.control<boolean | undefined>(undefined),
    close: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | undefined>(undefined),
    viewContext: this._formBuilder.control(true),
  });
  public navigateError: string | undefined;

  public routerLinkCommands$: Observable<any[]>;
  public navigationExtras$: Observable<WorkbenchNavigationExtras>;
  public routes: Routes;

  public nullViewInjector: Injector;

  constructor(private _formBuilder: NonNullableFormBuilder,
              injector: Injector,
              private _router: Router,
              private _wbRouter: WorkbenchRouter,
              public workbenchService: WorkbenchService) {
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
      .filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET)
      .filter(route => !route.path?.startsWith('~')); // microfrontend route prefix

    this.nullViewInjector = Injector.create({
      parent: injector,
      providers: [
        {provide: WorkbenchView, useValue: undefined},
      ],
    });
  }

  public onRouterNavigate(): void {
    this.navigateError = undefined;
    const commands: any[] = this.constructRouterLinkCommands();
    const extras: WorkbenchNavigationExtras = this.constructNavigationExtras();

    this._wbRouter.navigate(commands, extras)
      .then(success => success ? Promise.resolve() : Promise.reject('Navigation failed'))
      .catch(error => this.navigateError = error);
  }

  private constructRouterLinkCommands(): any[] {
    const matrixParams: Params | null = SciKeyValueFieldComponent.toDictionary(this.form.controls.matrixParams);
    const path = this.form.controls.path.value;
    const commands: any[] = path === '<empty>' ? [] : path.split('/');

    // When tokenizing the path into segments, an empty segment is created for the leading slash (if any).
    if (path.startsWith('/')) {
      commands[0] = '/';
    }

    return commands.concat(matrixParams ? matrixParams : []);
  }

  private constructNavigationExtras(): WorkbenchNavigationExtras {
    return {
      queryParams: SciKeyValueFieldComponent.toDictionary(this.form.controls.queryParams),
      activate: this.form.controls.activate.value,
      close: this.form.controls.close.value,
      target: this.form.controls.target.value || undefined,
      blankPartId: this.form.controls.blankPartId.value || undefined,
      blankInsertionIndex: coerceInsertionIndex(this.form.controls.insertionIndex.value),
      state: SciKeyValueFieldComponent.toDictionary(this.form.controls.navigationalState) ?? undefined,
      cssClass: this.form.controls.cssClass.value?.split(/\s+/).filter(Boolean),
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
