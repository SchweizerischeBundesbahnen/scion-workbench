/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Injector, numberAttribute} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {WorkbenchNavigationExtras, WorkbenchRouter, WorkbenchRouterLinkDirective, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {NgTemplateOutlet} from '@angular/common';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SettingsService} from '../settings.service';
import {stringifyError} from '../common/stringify-error.util';
import {RouterCommandsComponent} from '../router-commands/router-commands.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {parseTypedObject} from '../common/parse-typed-value.util';
import {CssClassComponent} from '../css-class/css-class.component';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
  imports: [
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
    extras: this._formBuilder.group({
      data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      state: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      target: this._formBuilder.control(''),
      hint: this._formBuilder.control(''),
      partId: this._formBuilder.control(''),
      position: this._formBuilder.control(''),
      queryParams: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      activate: this._formBuilder.control<boolean | undefined>(undefined),
      close: this._formBuilder.control<boolean | undefined>(undefined),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
    viewContext: this._formBuilder.control(true),
  });
  protected navigateError: string | undefined;

  protected nullViewInjector: Injector;
  protected extras: WorkbenchNavigationExtras = {};

  protected targetList = `target-list-${UUID.randomUUID()}`;
  protected partList = `part-list-${UUID.randomUUID()}`;
  protected positionList = `position-list-${UUID.randomUUID()}`;

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
      .then(success => success ? Promise.resolve() : Promise.reject(Error('Navigation failed')))
      .then(() => this.resetForm())
      .catch((error: unknown) => this.navigateError = stringifyError(error));
  }

  protected onRouterLinkNavigate(): void {
    this.resetForm();
  }

  private readExtrasFromUI(): WorkbenchNavigationExtras {
    const extras = this.form.controls.extras.controls;
    return {
      queryParams: SciKeyValueFieldComponent.toDictionary(extras.queryParams),
      activate: extras.activate.value,
      close: extras.close.value,
      target: extras.target.value || undefined,
      hint: extras.hint.value || undefined,
      partId: extras.partId.value || undefined,
      position: coercePosition(extras.position.value),
      data: parseTypedObject(SciKeyValueFieldComponent.toDictionary(extras.data)) ?? undefined,
      state: parseTypedObject(SciKeyValueFieldComponent.toDictionary(extras.state)) ?? undefined,
      cssClass: extras.cssClass.value,
    };
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
      this.form.controls.extras.setControl('queryParams', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
      this.form.controls.extras.setControl('data', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
      this.form.controls.extras.setControl('state', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
  }
}

function coercePosition(value: unknown): number | 'start' | 'end' | 'before-active-view' | 'after-active-view' | undefined {
  if (value === '') {
    return undefined;
  }
  if (value === 'start' || value === 'end' || value === 'before-active-view' || value === 'after-active-view' || value === undefined) {
    return value;
  }
  return numberAttribute(value);
}
