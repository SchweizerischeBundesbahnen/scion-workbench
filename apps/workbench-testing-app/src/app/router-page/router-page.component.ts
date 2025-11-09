/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, numberAttribute} from '@angular/core';
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
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
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
    MultiValueInputComponent,
  ],
})
export default class RouterPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _wbRouter = inject(WorkbenchRouter);
  private readonly _settingsService = inject(SettingsService);

  protected readonly workbenchService = inject(WorkbenchService);
  protected readonly targetList = `target-list-${UUID.randomUUID()}`;
  protected readonly partList = `part-list-${UUID.randomUUID()}`;
  protected readonly positionList = `position-list-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
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
    rootContext: this._formBuilder.control(false),
  });

  protected readonly nullContextInjector = Injector.create({
    parent: inject(Injector),
    providers: [
      {provide: WorkbenchView, useValue: undefined},
    ],
  });

  protected navigateError: string | undefined;
  protected extras: WorkbenchNavigationExtras = {};

  constructor() {
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
