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
import { ViewPartGridProvider } from '../view-part-grid/view-part-grid-provider.service';

// TODO [issue/163] remove this service and move functionality to {WorkbenchViewPart}
@Injectable()
export class WorkbenchViewPartService implements OnDestroy {

  private _hiddenViewTabs = new Set<string>();
  private _hiddenViewTabs$ = new BehaviorSubject<string[]>([]);

  constructor(private _workbench: InternalWorkbenchService,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartGridProvider: ViewPartGridProvider,
              private _viewPart: InternalWorkbenchViewPart) {
    this._workbench.registerViewPartService(this);
    this.activate();
  }

  public get viewPartRef(): string {
    return this._viewPart.viewPartRef;
  }

  public get viewRefs(): string[] {
    return this._viewPart.viewRefs;
  }

  /**
   * Emits the views contained in this viewpart.
   */
  public get viewRefs$(): Observable<string[]> {
    return this._viewPart.viewRefs$;
  }

  public get activeViewRef(): string | null {
    return this._viewPart.activeViewRef;
  }

  public get activeViewRef$(): Observable<string | null> {
    return this._viewPart.activeViewRef$;
  }

  public get activeView(): InternalWorkbenchView | null {
    return this._viewRegistry.getElseNull(this._viewPart.activeViewRef);
  }

  /**
   * Makes the associated view part the active workbench view part.
   */
  public activate(): void {
    this._workbench.activeViewPartService = this;
  }

  public containsView(viewRef: string): boolean {
    return this._viewPart.viewRefs.includes(viewRef);
  }

  /**
   * Removes this viewpart's active view from this viewpart, and activates the previous view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public destroyActiveView(): Promise<boolean> {
    return this.activeViewRef && this._workbench.destroyView(this.activeViewRef) || Promise.resolve(true);
  }

  /**
   * Removes this viewpart with all its views from the workbench.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public remove(): Promise<boolean> {
    return this._workbench.destroyView(...this.viewRefs);
  }

  /**
   * Activates the specified view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public activateView(viewRef: string): Promise<boolean> {
    if (this.activeViewRef === viewRef) {
      return Promise.resolve(true);
    }

    const serializedGrid = this._viewPartGridProvider.grid
      .activateView(this._viewPart.viewPartRef, viewRef)
      .serialize();

    return this._viewOutletNavigator.navigate({viewGrid: serializedGrid});
  }

  /**
   * Activates the view next to the active view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public activateSiblingView(): Promise<boolean> {
    const grid = this._viewPartGridProvider.grid;

    const serializedGrid = grid
      .activateSiblingView(this.viewPartRef, this.activeViewRef)
      .serialize();

    return this._viewOutletNavigator.navigate({viewGrid: serializedGrid});
  }

  public isViewActive(viewRef: string): boolean {
    return this.activeViewRef === viewRef;
  }

  public viewCount(): number {
    return this.viewRefs.length;
  }

  public setHiddenViewTabs(viewRefs: string[]): void {
    this._hiddenViewTabs.clear();
    viewRefs.forEach(viewRef => this._hiddenViewTabs.add(viewRef));
    this._hiddenViewTabs$.next(viewRefs);
  }

  public isViewTabHidden(viewRef: string): boolean {
    return this._hiddenViewTabs.has(viewRef);
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
