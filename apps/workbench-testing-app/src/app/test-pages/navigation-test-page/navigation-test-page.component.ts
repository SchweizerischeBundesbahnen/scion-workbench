/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {WorkbenchView} from '@scion/workbench';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-navigation-test-page',
  template: '',
  standalone: true,
})
export class NavigationTestPageComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute, view: WorkbenchView) {
    route.paramMap
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => {
        if (params.has('title')) {
          view.title = params.get('title');
        }
        if (params.has('heading')) {
          view.heading = params.get('heading');
        }
        if (params.has('cssClass')) {
          view.cssClass = params.get('cssClass');
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
