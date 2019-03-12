/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { InternalWorkbenchView, InternalWorkbenchViewPart } from '../workbench.model';
import { VIEW_GRID_QUERY_PARAM } from '../workbench.constants';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { InternalWorkbenchService } from '../workbench.service';
import { Router } from '@angular/router';
import { Region } from './view-drop-zone.directive';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { WorkbenchViewPartRegistry } from '../view-part-grid/workbench-view-part-registry.service';
import { TaskScheduler } from '../task-scheduler.service';

@Injectable()
export class WorkbenchViewPartService implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _hiddenViewTabs = new Set<string>();
  private _hiddenViewTabs$ = new BehaviorSubject<string[]>([]);

  constructor(private _workbench: InternalWorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _router: Router,
              private _viewPart: InternalWorkbenchViewPart,
              private _taskScheduler: TaskScheduler) {
    this._workbench.registerViewPartService(this);
    this.activate();
  }

  public get viewPartRef(): string {
    return this._viewPart.viewPartRef;
  }

  public get viewRefs(): string[] {
    return this._viewPart.viewRefs;
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
   * Swaps the two specified views.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public swapViewTabs(viewRef1: string, viewRef2: string): Promise<boolean> {
    if (viewRef1 === viewRef2) {
      return Promise.resolve(true);
    }

    const serializedGrid = this._viewPartRegistry.grid
      .swapViews(this._viewPart.viewPartRef, viewRef1, viewRef2)
      .serialize();

    return this.navigate([], serializedGrid, true);
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

    const serializedGrid = this._viewPartRegistry.grid
      .activateView(this._viewPart.viewPartRef, viewRef)
      .serialize();

    return this.navigate([], serializedGrid);
  }

  /**
   * Moves the specified view to this workbench viewpart.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public moveViewToThisViewPart(viewRef: string): Promise<boolean> {
    const grid = this._viewPartRegistry.grid;

    const serializedGrid = grid
      .removeView(viewRef)
      .addView(this._viewPart.viewPartRef, viewRef)
      .serialize();

    return this.navigate([], serializedGrid, true);
  }

  /**
   * Moves the specified view to a new workbench viewpart.
   * The new viewpart is created relative to this viewpart in the specified region.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public moveViewToNewViewPart(viewRef: string, region: Region): Promise<boolean> {
    const grid = this._viewPartRegistry.grid;
    const newViewPartRef = grid.computeNextViewPartIdentity();

    const serializedGrid = grid
      .addSiblingViewPart(region, this._viewPart.viewPartRef, newViewPartRef)
      .removeView(viewRef)
      .addView(newViewPartRef, viewRef)
      .serialize();

    return this.navigate([], serializedGrid, true);
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

  /**
   * Navigate based on the provided array of commands with the view grid set as query parameter.
   *
   * Set 'async' to `true` for guaranteed asynchronous routing, which is essential when routing is a consequence of a drag & drop operation like moving view tabs.
   * Otherwise, 'dragend' event would not be dispatched if the source node is moved or removed during the drag.
   */
  private navigate(commands: any[], serializedGrid: string, async: boolean = false): Promise<boolean> {
    const navigateFn = ((): Promise<boolean> => {
      return this._router.navigate(commands, {
        queryParams: {[VIEW_GRID_QUERY_PARAM]: serializedGrid},
        queryParamsHandling: 'merge'
      });
    });

    if (async) {
      return new Promise<boolean>((resolve: (status: boolean) => void, reject: (reason?: any) => void): void => {
        this._taskScheduler.scheduleMacrotask(() => navigateFn().then(resolve).catch(reject));
      });
    }
    else {
      return navigateFn();
    }
  }

  public ngOnDestroy(): void {
    this._workbench.unregisterViewPartService(this);
    this._destroy$.next();
  }
}
