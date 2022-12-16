/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench-client';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {APP_IDENTITY} from '@scion/microfrontend-platform';
import {SciFormFieldModule} from '@scion/components.internal/form-field';

const VIEW_COUNT = 'viewCount';
const CSS_CLASS = 'cssClass';

@Component({
  selector: 'app-bulk-navigation-test-page',
  templateUrl: './bulk-navigation-test-page.component.html',
  styleUrls: ['./bulk-navigation-test-page.component.scss'],
  standalone: true,
  imports: [
    SciFormFieldModule,
    ReactiveFormsModule,
  ]
})
export class BulkNavigationTestPageComponent {

  public readonly VIEW_COUNT = VIEW_COUNT;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder,
              private _router: WorkbenchRouter,
              @Inject(APP_IDENTITY) private _appSymbolicName: string) {
    this.form = formBuilder.group({
      [VIEW_COUNT]: formBuilder.control(1, Validators.required),
      [CSS_CLASS]: formBuilder.control('', Validators.required),
    });
  }

  public onNavigate(): void {
    const viewCount = this.form.get(VIEW_COUNT).value ?? 0;
    for (let i = 0; i < viewCount; i++) {
      this.navigateToViewPage();
    }
  }

  public async onNavigateAwait(): Promise<void> {
    const viewCount = this.form.get(VIEW_COUNT).value ?? 0;
    for (let i = 0; i < viewCount; i++) {
      await this.navigateToViewPage();
    }
  }

  private navigateToViewPage(): Promise<boolean> {
    return this._router.navigate({component: 'view', app: this._appSymbolicName.split('-').pop()}, {
      target: 'blank',
      cssClass: this.form.get(CSS_CLASS).value,
    });
  }
}
