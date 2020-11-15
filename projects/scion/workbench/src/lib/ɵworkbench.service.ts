/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkbenchMenuItemFactoryFn, WorkbenchViewPartAction } from './workbench.model';
import { UUID } from '@scion/toolkit/uuid';
import { WorkbenchLayoutService } from './layout/workbench-layout.service';
import { Disposable } from './disposable';
import { Arrays } from '@scion/toolkit/util';
import { WorkbenchService } from './workbench.service';
import { WorkbenchRouter } from './routing/workbench-router.service';
import { map } from 'rxjs/operators';

@Injectable()
export class ɵWorkbenchService implements WorkbenchService { // tslint:disable-line:class-name

  public readonly viewPartActions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly viewMenuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  public readonly appInstanceId = UUID.randomUUID();

  constructor(private _wbRouter: WorkbenchRouter, private _layoutService: WorkbenchLayoutService) {
  }

  public destroyView(...viewIds: string[]): Promise<boolean> {
    return this._wbRouter.closeViews(...viewIds);
  }

  public activateView(viewId: string): Promise<boolean> {
    return this._wbRouter.ɵnavigate(layout => layout.activateView(viewId));
  }

  public resolveViewPart(viewId: string): string {
    return this._layoutService.layout.findPartByViewId(viewId, {orElseThrow: true}).partId;
  }

  public get views$(): Observable<string[]> {
    return this._layoutService.layout$.pipe(map(layout => layout.parts.reduce((viewIds, part) => viewIds.concat(part.viewIds), [])));
  }

  public registerViewPartAction(action: WorkbenchViewPartAction): Disposable {
    this.viewPartActions$.next([...this.viewPartActions$.value, action]);
    return {
      dispose: (): void => this.viewPartActions$.next(this.viewPartActions$.value.filter(it => it !== action)),
    };
  }

  public registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable {
    this.viewMenuItemProviders$.next([...this.viewMenuItemProviders$.value, factoryFn]);
    return {
      dispose: (): void => this.viewMenuItemProviders$.next(Arrays.remove(this.viewMenuItemProviders$.value, factoryFn, {firstOnly: false})),
    };
  }
}
