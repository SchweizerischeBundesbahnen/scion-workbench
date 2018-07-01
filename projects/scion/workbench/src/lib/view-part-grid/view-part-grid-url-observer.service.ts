import { Injectable, OnDestroy } from '@angular/core';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ViewPartGrid } from './view-part-grid.model';
import { ViewPartGridSerializerService } from './view-part-grid-serializer.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { VIEW_GRID_QUERY_PARAM } from '../workbench.constants';
import { ActivatedRoute } from '@angular/router';

/**
 * Provides the ability to watch for changes being made to the ViewPart grid in the URL.
 *
 * @see VIEW_GRID_QUERY_PARAM
 */
@Injectable()
export class ViewPartGridUrlObserver implements OnDestroy {

  private readonly _destroy$ = new Subject<void>();

  private _serializedGrid$ = new BehaviorSubject<string>(null);

  constructor(route: ActivatedRoute, private _serializer: ViewPartGridSerializerService) {
    route
      .queryParamMap
      .pipe(
        map(queryParams => queryParams.get(VIEW_GRID_QUERY_PARAM) || this._serializer.emptySerializedGrid()),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(this._serializedGrid$);
  }

  /**
   * Returns a copy of the current grid object, meaning that modifications to that grid object have no side effect.
   */
  public get snapshot(): ViewPartGrid {
    return this.createViewPartGrid(this._serializedGrid$.value);
  }

  /**
   * Emits if the viewpart grid changes via application URL.
   *
   * Each execution chain gets its separate copy of the grid object, meaning that modifications to that grid object
   * have no side effect to other subscription's grid object.
   */
  public get observe$(): Observable<ViewPartGrid> {
    return this._serializedGrid$
      .pipe(
        distinctUntilChanged(),
        map(serializedGrid => this.createViewPartGrid(serializedGrid))
      );
  }

  private createViewPartGrid(serializedGrid: string): ViewPartGrid {
    return new ViewPartGrid(this._serializer.parseGrid(serializedGrid), this._serializer);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
