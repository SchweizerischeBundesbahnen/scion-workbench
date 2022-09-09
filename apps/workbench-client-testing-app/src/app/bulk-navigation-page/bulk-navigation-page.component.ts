/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {WorkbenchNavigationExtras, WorkbenchRouter} from '@scion/workbench-client';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

const VIEW_QUALIFIER = {component: 'bulk-navigation-test-target'};
const NAVIGATION_EXTRAS: WorkbenchNavigationExtras = {target: 'blank', activateIfPresent: false};
const VIEW_COUNT = 'viewCount';

@Component({
  selector: 'app-bulk-navigation-page',
  templateUrl: './bulk-navigation-page.component.html',
  styleUrls: ['./bulk-navigation-page.component.scss'],
})
export class BulkNavigationPageComponent {

  public readonly VIEW_COUNT = VIEW_COUNT;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _router: WorkbenchRouter) {
    this.form = formBuilder.group({
      [VIEW_COUNT]: formBuilder.control(1, Validators.required),
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
    return this._router.navigate(VIEW_QUALIFIER, NAVIGATION_EXTRAS);
  }
}
