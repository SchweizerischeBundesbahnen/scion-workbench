/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, takeUntil} from 'rxjs/operators';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {combineLatest, Observable, Subject} from 'rxjs';
import {WorkbenchRouter, WorkbenchService} from '@scion/workbench';

@Component({
  selector: 'app-workbench',
  styleUrls: ['./workbench.component.scss'],
  templateUrl: './workbench.component.html',
})
export class WorkbenchComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public showNewTabAction$: Observable<boolean>;

  constructor(private _route: ActivatedRoute,
              private _workbench: WorkbenchService,
              private _wbRouter: WorkbenchRouter) {
    this.showNewTabAction$ = this._route.queryParamMap.pipe(map(params => !params.has('showNewTabAction') || coerceBooleanProperty(params.get('showNewTabAction'))));
    this.installStickyStartViewTab();
  }

  /**
   * If enabled, installs the handler to automatically open the start tab when the user closes the last tab.
   */
  private installStickyStartViewTab(): void {
    const stickyStartViewTab$ = this._route.queryParamMap.pipe(map(params => coerceBooleanProperty(params.get('stickyStartViewTab'))));
    const views$ = this._workbench.views$;
    combineLatest([stickyStartViewTab$, views$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([stickyStartViewTab, views]) => {
        if (stickyStartViewTab && views.length === 0) {
          this._wbRouter.navigate(['/start-page']).then();
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
