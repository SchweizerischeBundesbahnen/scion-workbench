/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench-client';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {APP_SYMBOLIC_NAME} from '../../workbench-client/workbench-client.provider';
import {MultiValueInputComponent} from '../../multi-value-input/multi-value-input.component';

@Component({
  selector: 'app-bulk-navigation-test-page',
  templateUrl: './bulk-navigation-test-page.component.html',
  styleUrls: ['./bulk-navigation-test-page.component.scss'],
  imports: [
    SciFormFieldComponent,
    ReactiveFormsModule,
    MultiValueInputComponent,
  ],
})
export default class BulkNavigationTestPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(WorkbenchRouter);
  private readonly _appSymbolicName = inject(APP_SYMBOLIC_NAME);

  protected readonly form = this._formBuilder.group({
    viewCount: this._formBuilder.control(1, Validators.required),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined, Validators.required),
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
    return this._router.navigate({component: 'view', app: this._appSymbolicName.split('-').pop()!}, {
      target: 'blank',
      cssClass: this.form.controls.cssClass.value,
    });
  }
}
