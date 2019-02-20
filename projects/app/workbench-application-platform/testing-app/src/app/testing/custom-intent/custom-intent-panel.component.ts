/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy } from '@angular/core';
import { NilQualifier } from '@scion/workbench-application-platform.api';
import { first, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { IntentService } from '@scion/workbench-application.core';

@Component({
  selector: 'app-custom-intent-panel',
  templateUrl: './custom-intent-panel.component.html',
  styleUrls: ['./custom-intent-panel.component.scss'],
})
export class CustomIntentPanelComponent implements OnDestroy {

  public result$: Observable<string>;
  private _destroy$ = new Subject<void>();

  constructor(private _intentService: IntentService) {
  }

  public onIssueIntent(): void {
    this.result$ = this._intentService.issueIntent$<string>('custom', NilQualifier, 'custom-intent-payload')
      .pipe(
        first(),
        takeUntil(this._destroy$)
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
