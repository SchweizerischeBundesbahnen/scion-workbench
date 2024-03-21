/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchRouter, WorkbenchService} from '@scion/workbench';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {stringifyError} from '../../common/stringify-error.util';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {PRIMARY_OUTLET, Router, Routes} from '@angular/router';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {RouterCommandsComponent} from '../../router-commands/router-commands.component';
import {SettingsService} from '../../settings.service';

@Component({
  selector: 'app-navigate-view-page',
  templateUrl: './navigate-view-page.component.html',
  styleUrls: ['./navigate-view-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
    RouterCommandsComponent,
  ],
})
export default class NavigateViewPageComponent {

  public form = this._formBuilder.group({
    viewId: this._formBuilder.control('', Validators.required),
    commands: this._formBuilder.control([]),
    state: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    options: this._formBuilder.group({
      outlet: this._formBuilder.control(''),
      cssClass: this._formBuilder.control<string | undefined>(undefined),
    }),
  });
  public navigateError: string | false | undefined;
  public routes: Routes;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _router: Router,
              private _wbRouter: WorkbenchRouter,
              private _settingsService: SettingsService,
              public workbenchService: WorkbenchService) {
    this.routes = this._router.config.filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET);
  }

  public onNavigate(): void {
    this.navigateError = undefined;

    this._wbRouter
      .ɵnavigate(layout => layout.navigateView(this.form.controls.viewId.value, this.form.controls.commands.value, {
        outlet: this.form.controls.options.controls.outlet.value || undefined,
        cssClass: this.form.controls.options.controls.cssClass.value?.split(/\s+/).filter(Boolean),
        state: SciKeyValueFieldComponent.toDictionary(this.form.controls.state) ?? undefined,
      }))
      .then(() => {
        this.navigateError = false;
        this.resetForm();
      })
      .catch(error => this.navigateError = stringifyError(error));
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
      this.form.setControl('state', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
  }
}
