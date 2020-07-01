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
import { provideWorkbenchView, WorkbenchView } from '@scion/workbench-application.angular';
import { Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

@Component({
  selector: 'app-view-28f32b51',
  templateUrl: './view-28f32b51.component.html',
  styleUrls: ['./view-28f32b51.component.scss'],
  providers: [
    provideWorkbenchView(View28f32b51Component),
  ],
})
export class View28f32b51Component {

  public activeLog$: Observable<string>;

  constructor(public view: WorkbenchView) {
    this.activeLog$ = view.active$
      .pipe(
        scan((acc: boolean[], active: boolean) => [...acc, active], [] as boolean[]),
        map(activeLog => activeLog.join('\n')),
      );
  }
}
