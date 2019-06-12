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
  selector: 'app-popup-9c5319f7',
  templateUrl: './popup-9c5319f7.component.html',
  styleUrls: ['./popup-9c5319f7.component.scss'],
  providers: [
    provideWorkbenchPopup(Popup9c5319f7Component),
  ],
})
export class Popup9c5319f7Component {

  public params$: Observable<Params>;
  public queryParams$: Observable<Params>;

  constructor(route: ActivatedRoute) {
    this.params$ = route.params;
    this.queryParams$ = route.queryParams;
  }
}
