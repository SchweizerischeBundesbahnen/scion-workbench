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
import {distinct, map} from 'rxjs/operators';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {combineLatest, Observable} from 'rxjs';
import {AsyncPipe, NgIf} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchModule, WorkbenchRouter, WorkbenchService} from '@scion/workbench';

@Component({
  selector: 'app-workbench',
  styleUrls: ['./workbench.component.scss'],
  templateUrl: './workbench.component.html',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    WorkbenchModule,
  ],
})
export class WorkbenchComponent implements OnDestroy {

  protected showNewTabAction$: Observable<boolean>;

  constructor(private _route: ActivatedRoute,
              private _wbRouter: WorkbenchRouter,
              protected workbenchService: WorkbenchService) {
    console.debug('[WorkbenchComponent#construct]');
    this.showNewTabAction$ = this._route.queryParamMap.pipe(map(params => !params.has('showNewTabAction') || coerceBooleanProperty(params.get('showNewTabAction'))));
    this.installStickyStartViewTab();
  }

  /**
   * If enabled, installs the handler to automatically open the start tab when the user closes the last tab.
   */
  private installStickyStartViewTab(): void {
    const stickyStartViewTab$ = this._route.queryParamMap.pipe(map(params => coerceBooleanProperty(params.get('stickyStartViewTab'))), distinct());
    const views$ = this.workbenchService.views$;
    combineLatest([stickyStartViewTab$, views$])
      .pipe(takeUntilDestroyed())
      .subscribe(([stickyStartViewTab, views]) => {
        if (stickyStartViewTab && views.length === 0) {
          this._wbRouter.navigate(['/start-page']).then();
        }
      });
  }

  public ngOnDestroy(): void {
    console.debug('[WorkbenchComponent#destroy]');
  }
}
