/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
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
  selector: 'app-popup-45dc693f',
  templateUrl: './popup-45dc693f.component.html',
  styleUrls: ['./popup-45dc693f.component.scss'],
  providers: [
    provideWorkbenchPopup(Popup45dc693fComponent),
  ],
})
export class Popup45dc693fComponent {

  public params$: Observable<Params>;
  public queryParams$: Observable<Params>;

  constructor(route: ActivatedRoute) {
    this.params$ = route.params;
    this.queryParams$ = route.queryParams;
  }
}
