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
import { WorkbenchView } from '@scion/workbench';
import { Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

@Component({
  selector: 'app-view-interaction',
  templateUrl: './view-interaction.component.html',
  styleUrls: ['./view-interaction.component.scss'],
})
export class ViewInteractionComponent {

  public activeLog$: Observable<string>;

  constructor(public view: WorkbenchView) {
    this.view.title = 'View Interaction';
    this.view.heading = 'Interact with the view';
    this.activeLog$ = view.active$
      .pipe(
        scan((acc: boolean[], active: boolean) => [...acc, active], [] as boolean[]),
        map(activeLog => activeLog.join('\n')),
      );
  }
}
