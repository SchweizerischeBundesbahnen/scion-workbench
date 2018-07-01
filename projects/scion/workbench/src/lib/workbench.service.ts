import { Injectable } from '@angular/core';
import { WorkbenchViewPartService } from './view-part/workbench-view-part.service';

@Injectable()
export class WorkbenchService {

  private _activeViewPartService: WorkbenchViewPartService;
  private _viewPartServices: WorkbenchViewPartService[] = [];

  /**
   * Destroys the specified workbench view and its associated routed component.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public destroyView(viewRef: string): Promise<boolean> {
    const viewPartService = this._viewPartServices.find(it => it.containsView(viewRef));
    if (viewPartService) {
      return viewPartService.destroyView(viewRef);
    }
    return Promise.resolve(false);
  }

  public resolveContainingViewPartServiceElseThrow(viewRef: string): WorkbenchViewPartService | null {
    const viewPartService = this._viewPartServices.find(it => it.containsView(viewRef));
    if (!viewPartService) {
      throw Error(`No ViewPartService for View found [view=${viewRef}]`);
    }
    return viewPartService;
  }

  public registerViewPartService(viewPartService: WorkbenchViewPartService): void {
    this._viewPartServices.push(viewPartService);
  }

  public unregisterViewPartService(viewPartService: WorkbenchViewPartService): void {
    const index = this._viewPartServices.indexOf(viewPartService);
    this._viewPartServices.splice(index, 1);
    if (viewPartService === this.activeViewPartService) {
      this.activeViewPartService = this._viewPartServices[index] || this._viewPartServices[this._viewPartServices.length - 1];
    }
  }

  /**
   * Sets the active viewpart service for this workbench.
   */
  public set activeViewPartService(viewPart: WorkbenchViewPartService) {
    this._activeViewPartService = viewPart;
  }

  /**
   * Returns the currently active viewpart service for this workbench.
   */
  public get activeViewPartService(): WorkbenchViewPartService {
    if (!this._activeViewPartService) {
      throw Error('No active ViewPart');
    }
    return this._activeViewPartService;
  }
}
