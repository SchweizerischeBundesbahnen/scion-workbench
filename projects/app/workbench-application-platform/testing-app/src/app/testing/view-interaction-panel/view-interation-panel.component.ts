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
import { WorkbenchView } from '@scion/workbench-application.angular';
import { Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

@Component({
  selector: 'app-view-interaction-panel',
  templateUrl: './view-interation-panel.component.html',
  styleUrls: ['./view-interation-panel.component.scss'],
})
export class ViewInterationPanelComponent {

  public activeLog$: Observable<string>;

  constructor(public view: WorkbenchView) {
    this.activeLog$ = view.active$
      .pipe(
        scan((acc: boolean[], active: boolean) => [...acc, active], [] as boolean[]),
        map(activeLog => activeLog.join('\n')),
      );
  }
}
