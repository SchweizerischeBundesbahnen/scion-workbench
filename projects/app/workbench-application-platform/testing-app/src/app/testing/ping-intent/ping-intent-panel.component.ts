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
import { NilQualifier } from '@scion/workbench-application-platform.api';
import { first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IntentService } from '@scion/workbench-application.core';

@Component({
  selector: 'app-ping-intent-panel',
  templateUrl: './ping-intent-panel.component.html',
  styleUrls: ['./ping-intent-panel.component.scss'],
})
export class PingIntentPanelComponent {

  public result$: Observable<string>;

  constructor(private _intentService: IntentService) {
  }

  public onPing(message: string): void {
    this.result$ = this._intentService.issueIntent$<string>('ping', NilQualifier, message)
      .pipe(first());
  }
}
