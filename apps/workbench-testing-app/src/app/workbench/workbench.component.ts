/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {booleanAttribute, Component, effect, inject, OnDestroy, Signal, untracked} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';
import {toSignal} from '@angular/core/rxjs-interop';
import {WorkbenchComponent as ScionWorkbenchComponent, WorkbenchDesktopDirective, WorkbenchDialogService, WorkbenchPart, WorkbenchPartActionDirective, WorkbenchRouter, WorkbenchRouterLinkDirective, WorkbenchService, WorkbenchView, WorkbenchViewMenuItemDirective} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ViewMoveDialogTestPageComponent} from '../test-pages/view-move-dialog-test-page/view-move-dialog-test-page.component';
import {ViewInfoDialogComponent} from '../view-info-dialog/view-info-dialog.component';
import StartPageComponent from '../start-page/start-page.component';
import {WorkbenchStartupQueryParams} from './workbench-startup-query-params';
import FocusTestPageComponent from '../test-pages/focus-test-page/focus-test-page.component';
import {DesktopPageComponent} from '../desktop/desktop-page.component';
import LayoutPageComponent from '../layout-page/layout-page.component';

@Component({
  selector: 'app-workbench',
  styleUrls: ['./workbench.component.scss'],
  templateUrl: './workbench.component.html',
  imports: [
    SciMaterialIconDirective,
    ScionWorkbenchComponent,
    WorkbenchPartActionDirective,
    WorkbenchRouterLinkDirective,
    WorkbenchViewMenuItemDirective,
    WorkbenchDesktopDirective,
    StartPageComponent,
    FocusTestPageComponent,
    DesktopPageComponent,
    LayoutPageComponent,
  ],
})
export class WorkbenchComponent implements OnDestroy {

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _dialogService = inject(WorkbenchDialogService);

  protected readonly workbenchService = inject(WorkbenchService);
  protected readonly desktop = this.readQueryParamFlag<'legacy-start-page' | 'desktop-page' | 'focus-page' | 'layout-page'>(WorkbenchStartupQueryParams.DESKTOP);

  constructor() {
    console.debug('[WorkbenchComponent#construct]');
    this.installStickyViewTab();
  }

  /**
   * Tests if given part is not a peripheral part.
   */
  protected isNotPeripheralPart = (part: WorkbenchPart): boolean => {
    return !part.peripheral();
  };

  protected onMoveView(view: WorkbenchView): void {
    void this._dialogService.open(ViewMoveDialogTestPageComponent, {
      inputs: {view},
      cssClass: 'e2e-move-view',
      context: {viewId: view.id},
    });
  }

  protected onShowViewInfo(view: WorkbenchView): void {
    void this._dialogService.open(ViewInfoDialogComponent, {
      inputs: {view},
      cssClass: 'e2e-view-info',
    });
  }

  /**
   * If enabled, installs the handler to automatically open the start view when the user closes the last view.
   */
  private installStickyViewTab(): void {
    const stickyViewTab = this.readQueryParamFlag('stickyViewTab', {transform: booleanAttribute});
    effect(() => {
      if (stickyViewTab() && !this.workbenchService.views().length) {
        untracked(() => void this._workbenchRouter.navigate(['/start-page']));
      }
    });
  }

  /**
   * Reads specified flag from query parameters.
   */
  private readQueryParamFlag<T = string>(param: string): Signal<T | null>;
  private readQueryParamFlag<T>(param: string, options: {transform: (value: string | null) => T}): Signal<T>;
  private readQueryParamFlag<T>(param: string, options?: {transform: (value: string | null) => T}): Signal<T | string | null> {
    const route = inject(ActivatedRoute);
    const flag$ = route.queryParamMap.pipe(map(params => options ? options.transform(params.get(param)) : params.get(param)));
    return toSignal(flag$, {requireSync: true});
  }

  public ngOnDestroy(): void {
    console.debug('[WorkbenchComponent#destroy]');
  }
}
