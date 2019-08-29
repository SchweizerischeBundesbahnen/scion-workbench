import { Injectable } from '@angular/core';
import { ViewPartGrid } from './view-part-grid.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Provides access to the viewpart grid which represents the visual arrangement of the viewparts.
 */
@Injectable()
export class ViewPartGridProvider {

  private readonly _grid$ = new BehaviorSubject<ViewPartGrid>(null);

  /**
   * Sets the given viewpart grid.
   */
  public setGrid(grid: ViewPartGrid): void {
    this._grid$.next(grid);
  }

  /**
   * Returns a reference to the viewpart grid, if any. Is `null` until the initial navigation is performed.
   */
  public get grid(): ViewPartGrid {
    return this._grid$.value;
  }

  /**
   * Emits the viewpart grid.
   *
   * Upon subscription, the current grid is emitted, if any, and then emits continuously when the grid changes. It never completes.
   */
  public get grid$(): Observable<ViewPartGrid> {
    return this._grid$.pipe(filter(Boolean));
  }
}
