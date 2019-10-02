/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { InternalWorkbenchView, InternalWorkbenchViewPart } from '../workbench.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { InternalWorkbenchService } from '../workbench.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';
import { PartsLayoutProvider } from '../view-part-grid/view-part-grid-provider.service';

// TODO [issue/163] remove this service and move functionality to {WorkbenchViewPart}
@Injectable()
export class WorkbenchViewPartService implements OnDestroy {

  private _hiddenViewTabs = new Set<string>();
  private _hiddenViewTabs$ = new BehaviorSubject<string[]>([]);

  constructor(private _workbench: InternalWorkbenchService,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _partsLayoutProvider: PartsLayoutProvider,
              private _viewPart: InternalWorkbenchViewPart) {
    this._workbench.registerViewPartService(this);
    this.activate();
  }

  public get partId(): string {
    return this._viewPart.partId;
  }

  public get viewIds(): string[] {
    return this._viewPart.viewIds;
  }

  /**
   * Emits the views contained in this viewpart.
   */
  public get viewIds$(): Observable<string[]> {
    return this._viewPart.viewIds$;
  }

  public get activeViewId(): string | null {
    return this._viewPart.activeViewId;
  }

  public get activeViewId$(): Observable<string | null> {
    return this._viewPart.activeViewId$;
  }

  public get activeView(): InternalWorkbenchView | null {
    return this._viewRegistry.getElseNull(this._viewPart.activeViewId);
  }

  /**
   * Makes the associated view part the active workbench view part.
   */
  public activate(): void {
    this._workbench.activeViewPartService = this;
  }

  public containsView(viewId: string): boolean {
    return this._viewPart.viewIds.includes(viewId);
  }

  /**
   * Removes this viewpart's active view from this viewpart, and activates the previous view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public destroyActiveView(): Promise<boolean> {
    return this.activeViewId && this._workbench.destroyView(this.activeViewId) || Promise.resolve(true);
  }

  /**
   * Removes this viewpart with all its views from the workbench.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public remove(): Promise<boolean> {
    return this._workbench.destroyView(...this.viewIds);
  }

  /**
   * Activates the specified view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public activateView(viewId: string): Promise<boolean> {
    if (this.activeViewId === viewId) {
      return Promise.resolve(true);
    }

    const serializedLayout = this._partsLayoutProvider.layout
      .activateView(viewId)
      .serialize();

    return this._viewOutletNavigator.navigate({partsLayout: serializedLayout});
  }

  /**
   * Activates the view next to the active view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public activateSiblingView(): Promise<boolean> {
    const grid = this._partsLayoutProvider.layout;

    const serializedLayout = grid
      .activateSiblingView(this.activeViewId)
      .serialize();

    return this._viewOutletNavigator.navigate({partsLayout: serializedLayout});
  }

  public isViewActive(viewId: string): boolean {
    return this.activeViewId === viewId;
  }

  public viewCount(): number {
    return this.viewIds.length;
  }

  public setHiddenViewTabs(viewIds: string[]): void {
    this._hiddenViewTabs.clear();
    viewIds.forEach(viewId => this._hiddenViewTabs.add(viewId));
    this._hiddenViewTabs$.next(viewIds);
  }

  public isViewTabHidden(viewId: string): boolean {
    return this._hiddenViewTabs.has(viewId);
  }

  public get hiddenViewTabCount(): number {
    return this._hiddenViewTabs.size;
  }

  public get hiddenViewTabs$(): Observable<string[]> {
    return this._hiddenViewTabs$.asObservable();
  }

  public ngOnDestroy(): void {
    this._workbench.unregisterViewPartService(this);
  }
}
