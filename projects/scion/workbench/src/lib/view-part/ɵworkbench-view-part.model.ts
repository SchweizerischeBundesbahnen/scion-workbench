/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {MPart} from '../layout/parts-layout.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {inject} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {Disposable} from '../disposable';
import {WorkbenchViewPartAction} from '../workbench.model';
import {WorkbenchViewPart} from './workbench-view-part.model';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';

export class ɵWorkbenchViewPart implements WorkbenchViewPart {

  private _part!: MPart;
  private _hiddenViewTabs = new Set<string>();
  private _hiddenViewTabs$ = new BehaviorSubject<string[]>([]);

  public readonly viewIds$ = new BehaviorSubject<string[]>([]);
  public readonly actions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly activeViewId$ = new BehaviorSubject<string | null>(null);
  public readonly portal: WbComponentPortal<any>;

  constructor(public readonly partId: string,
              viewPartComponent: ComponentType<any>, // do not reference `ViewPartComponent` to avoid import cycles
              private _workbenchLayoutService: WorkbenchLayoutService = inject(WorkbenchLayoutService),
              private _workbenchRouter: WorkbenchRouter = inject(WorkbenchRouter),
              private _viewRegistry: WorkbenchViewRegistry = inject(WorkbenchViewRegistry)) {
    this.portal = this.createPortal(viewPartComponent);
  }

  private createPortal(viewPartComponent: ComponentType<any>): WbComponentPortal<any> {
    return new WbComponentPortal(viewPartComponent, {
      providers: [
        {provide: ɵWorkbenchViewPart, useValue: this},
        {provide: WorkbenchViewPart, useExisting: ɵWorkbenchViewPart},
      ],
    });
  }

  public setPart(part: MPart): void {
    const prevViewIds = this._part?.viewIds;
    const prevActiveViewId = this._part?.activeViewId;
    this._part = part;

    // Update views if changed
    if (!Arrays.isEqual(prevViewIds, part.viewIds, {exactOrder: true})) {
      this.viewIds$.next(part.viewIds);
    }

    // Update active view if changed
    if (prevActiveViewId !== part.activeViewId) {
      this.activeViewId$.next(part.activeViewId ?? null);
      part.viewIds.forEach(viewId => this._viewRegistry.getElseThrow(viewId).activate(viewId === part.activeViewId));
    }
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
    if (this.isActive()) {
      return true;
    }

    return this._workbenchRouter.ɵnavigate(layout => layout.activatePart(this.partId));
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
    if (this.activeViewId === viewId) {
      return true;
    }

    return this._workbenchRouter.ɵnavigate(layout => layout.activateView(viewId));
  }

  /**
   * Activates the view next to the active view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activateSiblingView(): Promise<boolean> {
    if (!this.activeViewId) {
      return false;
    }

    return this._workbenchRouter.ɵnavigate(layout => layout.activateAdjacentView(this.activeViewId!));
  }

  public isActive(): boolean {
    return (this._workbenchLayoutService.layout?.activePart.partId === this.partId);
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

  public destroy(): void {
    // IMPORTANT: Views are explicitly destroyed and must not be destroyed with the destruction of the viewpart.
    // Otherwise, moving the last view to another part would fail because the view would already be destroyed.
    this.viewIds.forEach(viewId => this._viewRegistry.getElseNull(viewId)?.portal.detach());
    this.portal.destroy();
  }
}
