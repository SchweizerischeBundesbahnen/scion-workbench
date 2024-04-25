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
import {combineLatest} from 'rxjs';
import {AsyncPipe, NgIf} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchComponent as ScionWorkbenchComponent, WorkbenchDialogService, WorkbenchPart, WorkbenchPartActionDirective, WorkbenchRouter, WorkbenchRouterLinkDirective, WorkbenchService, WorkbenchView, WorkbenchViewMenuItemDirective} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ViewMoveDialogTestPageComponent} from '../test-pages/view-move-dialog-test-page/view-move-dialog-test-page.component';
import {ViewInfoDialogComponent} from '../view-info-dialog/view-info-dialog.component';

@Component({
  selector: 'app-workbench',
  styleUrls: ['./workbench.component.scss'],
  templateUrl: './workbench.component.html',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    SciMaterialIconDirective,
    ScionWorkbenchComponent,
    WorkbenchPartActionDirective,
    WorkbenchRouterLinkDirective,
    WorkbenchViewMenuItemDirective,
  ],
})
export class WorkbenchComponent implements OnDestroy {

  constructor(private _route: ActivatedRoute,
              private _wbRouter: WorkbenchRouter,
              private _dialogService: WorkbenchDialogService,
              protected workbenchService: WorkbenchService) {
    console.debug('[WorkbenchComponent#construct]');
    this.installStickyStartViewTab();
  }

  /**
   * Tests if given part is in the main area.
   */
  protected isPartInMainArea = (part: WorkbenchPart): boolean => {
    return part.isInMainArea;
  };

  protected onMoveView(view: WorkbenchView): void {
    this._dialogService.open(ViewMoveDialogTestPageComponent, {
      inputs: {view},
      cssClass: 'e2e-move-view',
      context: {viewId: view.id},
    });
  }

  protected onShowViewInfo(view: WorkbenchView): void {
    this._dialogService.open(ViewInfoDialogComponent, {
      inputs: {view},
      cssClass: 'e2e-view-info',
    });
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
