/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { MPart } from '../layout/parts-layout.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { ViewPartComponent } from './view-part.component';
import { Injector } from '@angular/core';
import { Arrays } from '@scion/toolkit/util';
import { Disposable } from '../disposable';
import { WorkbenchViewPartAction } from '../workbench.model';
import { WorkbenchViewPart } from './workbench-view-part.model';

export class ɵWorkbenchViewPart implements WorkbenchViewPart { // tslint:disable-line:class-name

  private _part: MPart;
  private _hiddenViewTabs = new Set<string>();
  private _hiddenViewTabs$ = new BehaviorSubject<string[]>([]);
  private _layoutService: WorkbenchLayoutService;
  private _viewOutletNavigator: ViewOutletNavigator;
  private _markedForDestruction = false;

  public readonly viewIds$ = new BehaviorSubject<string[]>([]);
  public readonly actions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly activeViewId$ = new BehaviorSubject<string | null>(null);

  constructor(public readonly partId: string,
              public readonly portal: WbComponentPortal<ViewPartComponent>,
              injector: Injector) {
    this._layoutService = injector.get(WorkbenchLayoutService);
    this._viewOutletNavigator = injector.get(ViewOutletNavigator);
  }

  public setPart(part: MPart): void {
    const viewIdsChange = !Arrays.isEqual(part.viewIds, this._part?.viewIds || [], {exactOrder: true});
    const activeViewChange = part.activeViewId !== this._part?.activeViewId;

    this._part = part;
    viewIdsChange && this.viewIds$.next(part.viewIds);
    activeViewChange && this.activeViewId$.next(part.activeViewId);
  }

  public get viewIds(): string[] {
    return this._part.viewIds;
  }

  public get activeViewId(): string {
    return this._part.activeViewId;
  }

  public registerViewPartAction(action: WorkbenchViewPartAction): Disposable {
    this.actions$.next([...this.actions$.value, action]);
    return {
      dispose: (): void => this.actions$.next(Arrays.remove(this.actions$.value, action, {firstOnly: false})),
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

    const serializedLayout = this._layoutService.layout
      .activatePart(this.partId)
      .serialize();

    return this._viewOutletNavigator.navigate({partsLayout: serializedLayout});
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

    const serializedLayout = this._layoutService.layout
      .activateView(viewId)
      .serialize();

    return this._viewOutletNavigator.navigate({partsLayout: serializedLayout});
  }

  /**
   * Activates the view next to the active view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activateSiblingView(): Promise<boolean> {
    if (this._markedForDestruction) {
      return false;
    }

    const serializedLayout = this._layoutService.layout
      .activateAdjacentView(this.activeViewId)
      .serialize();

    return this._viewOutletNavigator.navigate({partsLayout: serializedLayout});
  }

  public isActive(): boolean {
    return (this._layoutService.layout.activePart.partId === this.partId);
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
