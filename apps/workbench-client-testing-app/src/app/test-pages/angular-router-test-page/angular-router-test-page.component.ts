/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {RouterCommandsComponent} from 'workbench-testing-app-common';

@Component({
  selector: 'app-angular-router-test-page',
  templateUrl: './angular-router-test-page.component.html',
  styleUrls: ['./angular-router-test-page.component.scss'],
  imports: [
    SciFormFieldComponent,
    ReactiveFormsModule,
    SciKeyValueFieldComponent,
    RouterCommandsComponent,
  ],
})
export default class AngularRouterTestPageComponent {

  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    commands: this._formBuilder.control([]),
    queryParams: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  protected readonly location = inject(Location);

  protected onNavigate(): void {
    const commands = this.form.controls.commands.value;

    void this._router.navigate(commands, {
      relativeTo: this._route,
      queryParams: SciKeyValueFieldComponent.toDictionary(this.form.controls.queryParams) ?? undefined,
    });
  }
}
