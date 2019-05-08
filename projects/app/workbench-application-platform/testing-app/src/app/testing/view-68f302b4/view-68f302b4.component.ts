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
import { AppInstance } from '../app-instance.service';
import { UUID } from '@scion/workbench-application.core';

@Component({
  selector: 'app-view-68f302b4',
  templateUrl: './view-68f302b4.component.html',
  styleUrls: ['./view-68f302b4.component.scss'],
  providers: [
    provideWorkbenchView(View68f302b4Component),
  ],
})
export class View68f302b4Component {

  public uuid = UUID.randomUUID();
  public params$: Observable<Params>;
  public queryParams$: Observable<Params>;

  constructor(route: ActivatedRoute, public appInstance: AppInstance) {
    this.params$ = route.params;
    this.queryParams$ = route.queryParams;
  }
}
