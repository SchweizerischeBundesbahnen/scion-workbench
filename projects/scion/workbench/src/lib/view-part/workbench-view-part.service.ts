import { Injectable, OnDestroy } from '@angular/core';
import { InternalWorkbenchView, InternalWorkbenchViewPart } from '../workbench.model';
import { VIEW_GRID_QUERY_PARAM } from '../workbench.constants';
import { Subject } from 'rxjs';
import { WorkbenchService } from '../workbench.service';
import { Router } from '@angular/router';
import { Region } from '../view-part-grid/drop-zone.directive';
import { ViewPartGridUrlObserver } from '../view-part-grid/view-part-grid-url-observer.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';

@Injectable()
export class WorkbenchViewPartService implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _hiddenViewTabs = new Set<string>();
  private _viewListVisible = false;

  constructor(private _workbench: WorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _router: Router,
              private _viewPartGridUrlObserver: ViewPartGridUrlObserver,
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

  public get activeViewRef(): string | null {
    return this._viewPart.activeViewRef;
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
   * Removes the given view from this workbench viewpart, and activates the previous view.
   * In case the view was the last view of the viewpart, the viewpart is removed as well.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public destroyView(viewRef: string): Promise<boolean> {
    const serializedGrid = this._viewPartGridUrlObserver.snapshot
      .removeView(this._viewPart.viewPartRef, viewRef)
      .serialize();

    return this.navigate([{outlets: {[viewRef]: null}}], serializedGrid);
  }

  /**
   * Removes this viewpart's active view from this viewpart, and activates the previous view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public destroyActiveView(): Promise<boolean> {
    return this.activeViewRef && this.destroyView(this.activeViewRef) || Promise.resolve(true);
  }

  /**
   * Removes this viewpart with all its views from the workbench.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public remove(): Promise<boolean> {
    const outlets = this.viewRefs.reduce((acc, viewRef) => ({...acc, [viewRef]: null}), {});
    const serializedGrid = this.viewRefs
      .reduce((grid, viewRef) => grid.removeView(this._viewPart.viewPartRef, viewRef), this._viewPartGridUrlObserver.snapshot)
      .serialize();

    return this.navigate([{outlets}], serializedGrid);
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

    const serializedGrid = this._viewPartGridUrlObserver.snapshot
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

    const serializedGrid = this._viewPartGridUrlObserver.snapshot
      .activateView(this._viewPart.viewPartRef, viewRef)
      .serialize();

    return this.navigate([], serializedGrid).then(status => {
      this.toggleViewList(false);
      return status;
    });
  }

  /**
   * Moves the specified view to this workbench viewpart.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public moveViewToThisViewPart(viewRef: string): Promise<boolean> {
    const grid = this._viewPartGridUrlObserver.snapshot;

    const sourceViewPartRef = grid.findContainingViewPartElseThrow(viewRef);
    const targetViewPartRef = this._viewPart.viewPartRef;

    const serializedGrid = grid
      .removeView(sourceViewPartRef, viewRef)
      .addView(targetViewPartRef, viewRef)
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
    const grid = this._viewPartGridUrlObserver.snapshot;

    const sourceViewPartRef = grid.findContainingViewPartElseThrow(viewRef);
    const newViewPartRef = grid.computeNextViewPartIdentity();

    const serializedGrid = grid
      .addSiblingViewPart(region, this._viewPart.viewPartRef, newViewPartRef)
      .removeView(sourceViewPartRef, viewRef)
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

    if (viewRefs.length === 0) {
      this.toggleViewList(false);
    }
  }

  /**
   * Controls the open state of the view menu list.
   *
   * @param open
   *   If not specified, the menu list is toggled. If 'true', the menu list is opened, or closed otherwise.
   */
  public toggleViewList(open?: boolean): void {
    if (open === undefined) {
      this._viewListVisible = !this._viewListVisible;
    } else {
      this._viewListVisible = open;
    }
  }

  public isViewTabHidden(viewRef: string): boolean {
    return this._hiddenViewTabs.has(viewRef);
  }

  public get hiddenViewTabCount(): number {
    return this._hiddenViewTabs.size;
  }

  public get viewListVisible(): boolean {
    return this._viewListVisible;
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
        setTimeout(() => navigateFn().then(resolve).catch(reject));
      });
    } else {
      return navigateFn();
    }
  }

  public ngOnDestroy(): void {
    this._workbench.unregisterViewPartService(this);
    this._destroy$.next();
  }
}
