/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, numberAttribute, signal} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WORKBENCH_ELEMENT, WorkbenchElement, WorkbenchNavigationExtras, WorkbenchRouter} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';
import {MultiValueInputComponent, parseTypedObject, prune, stringifyError} from 'workbench-testing-app-common';
import {Beans} from '@scion/toolkit/bean-manager';
import {contributeMenu, SciToolbarComponent} from '@scion/sci-components/menu';
import {Disposable, WorkbenchMenuContextKeys} from '@scion/workbench';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    MultiValueInputComponent,
    SciToolbarComponent,
  ],
})
export class RouterPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(WorkbenchRouter);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([], Validators.required),
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    target: this._formBuilder.control(''),
    partId: this._formBuilder.control(''),
    position: this._formBuilder.control(''),
    activate: this._formBuilder.control<boolean | undefined>(undefined),
    close: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  protected readonly targetList = `target-list-${UUID.randomUUID()}`;
  protected readonly positionList = `position-list-${UUID.randomUUID()}`;

  protected navigateError: string | undefined;
  protected injector = inject(Injector);
  protected toolbar1 = true;
  protected toolbar2 = true;
  protected registration: Disposable | undefined;
  private state = signal(false);

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();

    contributeMenu('toolbar:testee', toolbar => toolbar
        .addToolbarItem({
          icon: 'play_circle',
          label: '%play.label',
          onSelect: () => {
            this.state.update(state => !state);
          },
        })
      , {requiredContext: new Map().set(WorkbenchMenuContextKeys.ViewId, undefined)});
  }

  protected async onNavigate(): Promise<void> {
    this.navigateError = undefined;

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    const params = parseTypedObject(SciKeyValueFieldComponent.toDictionary(this.form.controls.params));

    const extras: WorkbenchNavigationExtras = prune({
      activate: this.form.controls.activate.value,
      close: this.form.controls.close.value,
      target: this.form.controls.target.value || undefined,
      partId: this.form.controls.partId.value || undefined,
      position: coercePosition(this.form.controls.position.value),
      params: params ?? undefined,
      cssClass: this.form.controls.cssClass.value ?? undefined,
    });
    await this._router.navigate(qualifier, extras)
      .then(success => success ? Promise.resolve() : Promise.reject(Error('Navigation failed')))
      .then(() => this.resetForm())
      .catch((error: unknown) => this.navigateError = stringifyError(error));
  }

  private resetForm(): void {
    this.form.reset();
    this.form.setControl('qualifier', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    this.form.setControl('params', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
  }

  protected toggleToolbar1(): void {
    this.toolbar1 = !this.toolbar1;
  }

  protected toggleToolbar2(): void {
    this.toolbar2 = !this.toolbar2;

  }

  protected toggleRegistratoin(): void {
    if (this.registration) {
      this.registration.dispose();
      this.registration = undefined;
    }
    else {
      this.registration = contributeMenu('toolbar:testee', toolbar => {
        console.log(`>>> DEVELOPER FACTORY FUNCTION [state=${this.state()}]`);
        if (this.state()) {
          toolbar.addToolbarItem('home', () => {
            console.log('>>> on click');
          })
        }
      }, {requiredContext: new Map().set(WorkbenchMenuContextKeys.ViewId, undefined), injector: this.injector})
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
