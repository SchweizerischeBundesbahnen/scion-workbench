/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, Injector, TemplateRef } from '@angular/core';
import { combineLatest, Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkbenchViewPartAction } from '../../workbench.model';
import { PortalInjector } from '@angular/cdk/portal';
import { WorkbenchViewPart } from '../workbench-view-part.model';
import { ɵWorkbenchService } from '../../ɵworkbench.service';

@Component({
  selector: 'wb-view-part-action-bar',
  templateUrl: './view-part-action-bar.component.html',
  styleUrls: ['./view-part-action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPartActionBarComponent {

  public startActions$: Observable<WorkbenchViewPartAction[]>;
  public endActions$: Observable<WorkbenchViewPartAction[]>;

  constructor(private _viewPart: WorkbenchViewPart, workbenchService: ɵWorkbenchService) {
    this.startActions$ = combineLatest([this._viewPart.actions$, workbenchService.viewPartActions$, this._viewPart.activeViewId$]).pipe(combineAndFilterViewPartActions('start'));
    this.endActions$ = combineLatest([this._viewPart.actions$, workbenchService.viewPartActions$, this._viewPart.activeViewId$]).pipe(combineAndFilterViewPartActions('end'));
  }

  public isTemplate(action: WorkbenchViewPartAction): boolean {
    return action.templateOrComponent instanceof TemplateRef;
  }

  public addViewPartToInjector(injector: Injector): Injector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(WorkbenchViewPart, this._viewPart);
    return new PortalInjector(injector, injectionTokens);
  }
}

function combineAndFilterViewPartActions(align: 'start' | 'end'): OperatorFunction<[WorkbenchViewPartAction[], WorkbenchViewPartAction[], string], WorkbenchViewPartAction[]> {
  return map(([localActions, globalActions, activeViewId]: [WorkbenchViewPartAction[], WorkbenchViewPartAction[], string]): WorkbenchViewPartAction[] => {
      return [...localActions, ...globalActions]
        .filter(action => (action.align || 'start') === align)
        .filter(action => !action.viewId || action.viewId === activeViewId);
    },
  );
}
