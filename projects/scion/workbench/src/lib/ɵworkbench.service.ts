/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkbenchMenuItemFactoryFn, WorkbenchViewPartAction} from './workbench.model';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {Disposable} from './disposable';
import {WorkbenchService} from './workbench.service';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {map} from 'rxjs/operators';
import {WorkbenchView} from './view/workbench-view.model';
import {WorkbenchViewRegistry} from './view/workbench-view.registry';

@Injectable()
export class ɵWorkbenchService implements WorkbenchService {

  public readonly viewPartActions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly viewMenuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  public readonly views$: Observable<string[]>;
  public readonly appInstanceId = UUID.randomUUID();

  constructor(private _workbenchRouter: WorkbenchRouter,
              private _viewRegistry: WorkbenchViewRegistry,
              workbenchLayoutService: WorkbenchLayoutService) {
    this.views$ = workbenchLayoutService.layout$.pipe(map(layout => layout.viewsIds));
  }

  public destroyView(...viewIds: string[]): Promise<boolean> {
    return this._workbenchRouter.closeViews(...viewIds);
  }

  public activateView(viewId: string): Promise<boolean> {
    return this._workbenchRouter.ɵnavigate(layout => layout.activateView(viewId));
  }

  public getView(viewId: string): WorkbenchView | null {
    return this._viewRegistry.getElseNull(viewId);
  }

  public registerViewPartAction(action: WorkbenchViewPartAction): Disposable {
    this.viewPartActions$.next([...this.viewPartActions$.value, action]);
    return {
      dispose: (): void => this.viewPartActions$.next(this.viewPartActions$.value.filter(it => it !== action)),
    };
  }

  public registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable {
    this.viewMenuItemProviders$.next(this.viewMenuItemProviders$.value.concat(factoryFn));
    return {
      dispose: (): void => {
        this.viewMenuItemProviders$.next(this.viewMenuItemProviders$.value.filter(it => it !== factoryFn));
      },
    };
  }
}
