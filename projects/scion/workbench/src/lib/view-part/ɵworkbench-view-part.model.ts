/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import {MPart} from '../layout/parts-layout.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {Injector} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {Disposable} from '../disposable';
import {WorkbenchViewPartAction} from '../workbench.model';
import {WorkbenchViewPart} from './workbench-view-part.model';
import {WorkbenchRouter} from '../routing/workbench-router.service';

export class ɵWorkbenchViewPart implements WorkbenchViewPart {

  private _part!: MPart;
  private _hiddenViewTabs = new Set<string>();
  private _hiddenViewTabs$ = new BehaviorSubject<string[]>([]);
  private _layoutService: WorkbenchLayoutService;
  private _wbRouter: WorkbenchRouter;
  private _markedForDestruction = false;

  public readonly viewIds$ = new BehaviorSubject<string[]>([]);
  public readonly actions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly activeViewId$ = new BehaviorSubject<string | null>(null);

  constructor(public readonly partId: string,
              public readonly portal: WbComponentPortal<any>, // do not reference `ViewPartComponent` to avoid import cycles
              injector: Injector) {
    this._layoutService = injector.get(WorkbenchLayoutService);
    this._wbRouter = injector.get(WorkbenchRouter);
  }

  public setPart(part: MPart): void {
    const viewIdsChange = !Arrays.isEqual(part.viewIds, this._part?.viewIds || [], {exactOrder: true});
    const activeViewChange = part.activeViewId !== this._part?.activeViewId;

    this._part = part;
    viewIdsChange && this.viewIds$.next(part.viewIds);
    activeViewChange && this.activeViewId$.next(part.activeViewId ?? null);
  }

  public get viewIds(): string[] {
    return this._part.viewIds;
  }

  public get activeViewId(): string | null {
    return this._part.activeViewId ?? null;
  }

  public registerViewPartAction(action: WorkbenchViewPartAction): Disposable {
    this.actions$.next(this.actions$.value.concat(action));
    return {
      dispose: (): void => {
        this.actions$.next(this.actions$.value.filter(it => it !== action));
      },
    };
  }

  /**
   * Makes the associated view part the active workbench view part.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activate(): Promise<boolean> {
    if (this._markedForDestruction) {
      return false;
    }

    if (this.isActive()) {
      return true;
    }

    return this._wbRouter.ɵnavigate(layout => layout.activatePart(this.partId));
  }

  public containsView(viewId: string): boolean {
    return this._part.viewIds.includes(viewId);
  }

  /**
   * Activates the specified view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activateView(viewId: string): Promise<boolean> {
    if (this._markedForDestruction) {
      return false;
    }

    if (this.activeViewId === viewId) {
      return true;
    }

    return this._wbRouter.ɵnavigate(layout => layout.activateView(viewId));
  }

  /**
   * Activates the view next to the active view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activateSiblingView(): Promise<boolean> {
    if (this._markedForDestruction || !this.activeViewId) {
      return false;
    }

    return this._wbRouter.ɵnavigate(layout => layout.activateAdjacentView(this.activeViewId!));
  }

  public isActive(): boolean {
    return (this._layoutService.layout?.activePart.partId === this.partId);
  }

  public setHiddenViewTabs(viewIds: string[]): void {
    this._hiddenViewTabs.clear();
    viewIds.forEach(viewId => this._hiddenViewTabs.add(viewId));
    this._hiddenViewTabs$.next(viewIds);
  }

  public get hiddenViewTabCount(): number {
    return this._hiddenViewTabs.size;
  }

  public get hiddenViewTabs$(): Observable<string[]> {
    return this._hiddenViewTabs$;
  }

  public preDestroy(): void {
    this._markedForDestruction = true;
  }

  public destroy(): void {
    this.portal.destroy();
  }
}
