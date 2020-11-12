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
import { ViewOutletNavigator } from './routing/view-outlet-navigator.service';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { WorkbenchViewPartRegistry } from './view-part/workbench-view-part.registry';
import { WorkbenchViewRegistry } from './view/workbench-view.registry';
import { ɵWorkbenchViewPart } from './view-part/ɵworkbench-view-part.model';
import { Disposable } from './disposable';
import { Arrays } from '@scion/toolkit/util';
import { WorkbenchService } from './workbench.service';

@Injectable()
export class ɵWorkbenchService implements WorkbenchService { // tslint:disable-line:class-name

  public readonly viewPartActions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly viewMenuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  public readonly appInstanceId = UUID.randomUUID();

  constructor(private _viewOutletNavigator: ViewOutletNavigator,
              private _layoutService: WorkbenchLayoutService,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _viewRegistry: WorkbenchViewRegistry) {
  }

  public destroyView(...viewIds: string[]): Promise<boolean> {
    const destroyViewFn = (viewId: string): Promise<boolean> => {
      return this._viewOutletNavigator.navigate({
        viewOutlet: {name: viewId, commands: null},
        partsLayout: this._layoutService.layout
          .removeView(viewId)
          .serialize(),
      });
    };

    // Use a separate navigate command to remove each view separately. Otherwise, if a view would reject destruction,
    // no view would be removed at all. Also, removal must be done sequentially to have a proper grid snapshot.
    return viewIds.reduce((prevDestroyPromise, viewId) => {
      return prevDestroyPromise.then(() => destroyViewFn(viewId));
    }, Promise.resolve(true));
  }

  public activateView(viewId: string): Promise<boolean> {
    return this.resolveViewPartElseThrow(viewId).activateView(viewId);
  }

  public resolveViewPart(viewId: string): string {
    return this.resolveViewPartElseThrow(viewId).partId;
  }

  private resolveViewPartElseThrow(viewId: string): ɵWorkbenchViewPart | null {
    const part = this._layoutService.layout.findPartByViewId(viewId, {orElseThrow: true});
    return this._viewPartRegistry.getElseThrow(part.partId);
  }

  public get views$(): Observable<string[]> {
    return this._viewRegistry.viewIds$;
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
