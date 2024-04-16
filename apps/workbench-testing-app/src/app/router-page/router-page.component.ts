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
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {AsyncPipe, NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SettingsService} from '../settings.service';
import {stringifyError} from '../common/stringify-error.util';
import {RouterCommandsComponent} from '../router-commands/router-commands.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {parseTypedObject} from '../common/parse-typed-value.util';
import {CssClassComponent} from '../css-class/css-class.component';

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
    RouterCommandsComponent,
    CssClassComponent,
  ],
})
export default class RouterPageComponent {

  protected form = this._formBuilder.group({
    commands: this._formBuilder.control([]),
    state: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    target: this._formBuilder.control(''),
    hint: this._formBuilder.control(''),
    partId: this._formBuilder.control(''),
    insertionIndex: this._formBuilder.control(''),
    queryParams: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    activate: this._formBuilder.control<boolean | undefined>(undefined),
    close: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    viewContext: this._formBuilder.control(true),
  });
  protected navigateError: string | undefined;

  protected nullViewInjector: Injector;
  protected extras: WorkbenchNavigationExtras = {};

  constructor(private _formBuilder: NonNullableFormBuilder,
              injector: Injector,
              private _wbRouter: WorkbenchRouter,
              private _settingsService: SettingsService,
              protected workbenchService: WorkbenchService) {
    this.nullViewInjector = Injector.create({
      parent: injector,
      providers: [
        {provide: WorkbenchView, useValue: undefined},
      ],
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.extras = this.readExtrasFromUI();
      });
  }

  protected onRouterNavigate(): void {
    this.navigateError = undefined;
    this._wbRouter.navigate(this.form.controls.commands.value, this.extras)
      .then(success => success ? Promise.resolve() : Promise.reject('Navigation failed'))
      .then(() => this.resetForm())
      .catch(error => this.navigateError = stringifyError(error));
  }

  protected onRouterLinkNavigate(): void {
    this.resetForm();
  }

  private readExtrasFromUI(): WorkbenchNavigationExtras {
    return {
      queryParams: SciKeyValueFieldComponent.toDictionary(this.form.controls.queryParams),
      activate: this.form.controls.activate.value,
      close: this.form.controls.close.value,
      target: this.form.controls.target.value || undefined,
      hint: this.form.controls.hint.value || undefined,
      partId: this.form.controls.partId.value || undefined,
      blankInsertionIndex: coerceInsertionIndex(this.form.controls.insertionIndex.value),
      state: parseTypedObject(SciKeyValueFieldComponent.toDictionary(this.form.controls.state)) ?? undefined,
      cssClass: this.form.controls.cssClass.value,
    };
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
      this.form.setControl('queryParams', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
      this.form.setControl('state', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
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
