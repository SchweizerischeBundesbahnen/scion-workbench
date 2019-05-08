/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { provideWorkbenchPopup } from '@scion/workbench-application.angular';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-popup-159913ad',
  templateUrl: './popup-159913ad.component.html',
  styleUrls: ['./popup-159913ad.component.scss'],
  providers: [
    provideWorkbenchPopup(Popup159913adComponent),
  ],
})
export class Popup159913adComponent {

  public params$: Observable<Params>;
  public queryParams$: Observable<Params>;

  constructor(route: ActivatedRoute) {
    this.params$ = route.params;
    this.queryParams$ = route.queryParams;
  }
}
