/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchTextService} from '@scion/workbench-client';
import {map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-observe-text',
  templateUrl: './observe-text.component.html',
  styleUrl: './observe-text.component.scss',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    AsyncPipe,
  ],
})
export default class ObserveTextComponent {

  private readonly _workbenchTextService = inject(WorkbenchTextService);

  protected readonly appList = `app-list-${UUID.randomUUID()}`;
  protected text$: Observable<string | undefined> | undefined;

  protected readonly formGroup = new FormGroup({
    translatable: new FormControl('', Validators.required),
    app: new FormControl('', Validators.required),
    timeout: new FormControl<number | null>(null),
  });

  protected onObserve(): void {
    const translatable = this.formGroup.controls.translatable.value!;
    const app = this.formGroup.controls.app.value!;
    const timeout = this.formGroup.controls.timeout.value ?? undefined;

    this.text$ = this._workbenchTextService.text$(translatable, {provider: app, timeout}).pipe(map(text => text ?? '<undefined>'));
    this.formGroup.disable();
  }

  protected onCancel(): void {
    this.text$ = undefined;
    this.formGroup.enable();
  }
}
