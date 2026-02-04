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
import {WorkbenchNavigationExtras, WorkbenchRouter} from '@scion/workbench-client';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {MultiValueInputComponent, prune} from 'workbench-testing-app-common';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';

@Component({
  selector: 'app-bulk-navigation-test-page',
  templateUrl: './bulk-navigation-test-page.component.html',
  styleUrls: ['./bulk-navigation-test-page.component.scss'],
  imports: [
    SciFormFieldComponent,
    ReactiveFormsModule,
    MultiValueInputComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class BulkNavigationTestPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(WorkbenchRouter);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([], Validators.required),
    target: this._formBuilder.control(''),
    viewCount: this._formBuilder.control(1, Validators.required),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  protected onNavigate(): void {
    const viewCount = this.form.controls.viewCount.value;
    for (let i = 0; i < viewCount; i++) {
      void this.navigateToViewPage();
    }
  }

  protected async onNavigateAwait(): Promise<void> {
    const viewCount = this.form.controls.viewCount.value;
    for (let i = 0; i < viewCount; i++) {
      await this.navigateToViewPage();
    }
  }

  private navigateToViewPage(): Promise<boolean> {
    const extras: WorkbenchNavigationExtras = prune({
      target: this.form.controls.target.value || undefined,
      cssClass: this.form.controls.cssClass.value ?? undefined,
    });

    return this._router.navigate(SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!, extras);
  }
}
