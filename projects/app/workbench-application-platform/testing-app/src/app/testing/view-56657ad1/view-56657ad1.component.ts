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
import { provideWorkbenchView } from '@scion/workbench-application.angular';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-view-56657ad1',
  templateUrl: './view-56657ad1.component.html',
  styleUrls: ['./view-56657ad1.component.scss'],
  providers: [
    provideWorkbenchView(View56657ad1Component),
  ],
})
export class View56657ad1Component {

  public params$: Observable<Params>;
  public queryParams$: Observable<Params>;

  constructor(route: ActivatedRoute) {
    this.params$ = route.params;
    this.queryParams$ = route.queryParams;
  }
}
