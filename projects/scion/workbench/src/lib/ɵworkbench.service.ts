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
import {WorkbenchMenuItemFactoryFn, WorkbenchPartAction} from './workbench.model';
import {UUID} from '@scion/toolkit/uuid';
import {Disposable} from './disposable';
import {WorkbenchService} from './workbench.service';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {WorkbenchViewRegistry} from './view/workbench-view.registry';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {WorkbenchPartRegistry} from './part/workbench-part.registry';
import {ɵWorkbenchView} from './view/ɵworkbench-view.model';
import {ɵWorkbenchPart} from './part/ɵworkbench-part.model';
import {ɵWorkbenchPerspective} from './perspective/ɵworkbench-perspective.model';
import {WorkbenchPerspectiveRegistry} from './perspective/workbench-perspective.registry';

@Injectable({providedIn: 'root'})
export class ɵWorkbenchService implements WorkbenchService {

  /**
   * A unique ID per instance of the app. If opened in a different browser tab, it has a different instance ID.
   */
  public readonly appInstanceId = UUID.randomUUID();

  public readonly perspectives$: Observable<readonly ɵWorkbenchPerspective[]>;
  public readonly parts$: Observable<readonly ɵWorkbenchPart[]>;
  public readonly views$: Observable<readonly ɵWorkbenchView[]>;

  public readonly partActions$ = new BehaviorSubject<WorkbenchPartAction[]>([]);
  public readonly viewMenuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);

  constructor(private _workbenchRouter: WorkbenchRouter,
              private _perspectiveRegistry: WorkbenchPerspectiveRegistry,
              private _partRegistry: WorkbenchPartRegistry,
              private _viewRegistry: WorkbenchViewRegistry,
              private _perspectiveService: WorkbenchPerspectiveService) {
    this.perspectives$ = this._perspectiveRegistry.perspectives$;
    this.parts$ = this._partRegistry.parts$;
    this.views$ = this._viewRegistry.views$;
  }

  /** @inheritDoc */
  public get perspectives(): readonly ɵWorkbenchPerspective[] {
    return this._perspectiveRegistry.perspectives;
  }

  /** @inheritDoc */
  public getPerspective(perspectiveId: string): ɵWorkbenchPerspective | null {
    return this._perspectiveRegistry.get(perspectiveId, {orElse: null});
  }

  /** @inheritDoc */
  public get parts(): readonly ɵWorkbenchPart[] {
    return this._partRegistry.parts;
  }

  /** @inheritDoc */
  public getPart(partId: string): ɵWorkbenchPart | null {
    return this._partRegistry.get(partId, {orElse: null});
  }

  /** @inheritDoc */
  public get views(): readonly ɵWorkbenchView[] {
    return this._viewRegistry.views;
  }

  /** @inheritDoc */
  public getView(viewId: string): ɵWorkbenchView | null {
    return this._viewRegistry.get(viewId, {orElse: null});
  }

  /** @inheritDoc */
  public registerPerspective(perspective: WorkbenchPerspectiveDefinition): Promise<void> {
    return this._perspectiveService.registerPerspective(perspective);
  }

  /** @inheritDoc */
  public switchPerspective(id: string): Promise<boolean> {
    return this._perspectiveService.switchPerspective(id);
  }

  /** @inheritDoc */
  public resetPerspective(): Promise<void> {
    return this._perspectiveService.resetPerspective();
  }

  /** @inheritDoc */
  public async closeViews(...viewIds: string[]): Promise<boolean> {
    // TODO [#27]: Use single navigation to close multiple views.
    // For example:
    // return this._workbenchRouter.ɵnavigate(layout => {
    //   return {
    //     layout: viewIds.reduce((layout, viewId) => layout.removeView(viewId), layout),
    //     viewOutlets: viewIds.reduce((outlets, viewId) => ({...outlets, [viewId]: null}), {}),
    //   };
    // });

    // To avoid canceling the entire navigation if some view(s) prevent(s) closing, close each view through a separate navigation.
    const navigations = await Promise.all(viewIds.map(viewId => {
      return this._workbenchRouter.navigate([], {target: viewId, close: true});
    }));
    return navigations.every(Boolean);
  }

  /** @inheritDoc */
  public registerPartAction(action: WorkbenchPartAction): Disposable {
    this.partActions$.next([...this.partActions$.value, action]);
    return {
      dispose: (): void => this.partActions$.next(this.partActions$.value.filter(it => it !== action)),
    };
  }

  /** @inheritDoc */
  public registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable {
    this.viewMenuItemProviders$.next(this.viewMenuItemProviders$.value.concat(factoryFn));
    return {
      dispose: (): void => {
        this.viewMenuItemProviders$.next(this.viewMenuItemProviders$.value.filter(it => it !== factoryFn));
      },
    };
  }
}
