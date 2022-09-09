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
import {WorkbenchRouter, WorkbenchView} from '@scion/workbench';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

const VIEW_COUNT = 'viewCount';
const CSS_CLASS = 'cssClass';

@Component({
  selector: 'app-bulk-navigation-page',
  templateUrl: './bulk-navigation-page.component.html',
  styleUrls: ['./bulk-navigation-page.component.scss'],
})
export class BulkNavigationPageComponent {

  public readonly VIEW_COUNT = VIEW_COUNT;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder, route: ActivatedRoute,
              view: WorkbenchView, private _router: WorkbenchRouter) {
    view.title = route.snapshot.data['title'];
    view.heading = route.snapshot.data['heading'];
    view.cssClass = route.snapshot.data['cssClass'];
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
    const cssClass = this.form.get(CSS_CLASS).value;
    return this._router.navigate(['test-view', {cssClass}], {target: 'blank', activateIfPresent: false});
  }
}
