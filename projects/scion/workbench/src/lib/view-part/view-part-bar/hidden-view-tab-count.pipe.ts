/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {combineLatest, Observable, of, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {mapArray} from '@scion/toolkit/operators';

/**
 * Counts the number of tabs not scrolled into view in the tabbar of the current part.
 */
@Pipe({name: 'wbHiddenViewTabCount$'})
export class HiddenViewTabCountPipe implements PipeTransform {

  constructor(private _viewRegistry: WorkbenchViewRegistry) {
  }

  public transform(viewIds: string[] | undefined | null): Observable<number> {
    if (!viewIds?.length) {
      return of(0);
    }

    return of(viewIds)
      .pipe(
        mapArray(viewId => this._viewRegistry.getElseThrow(viewId)),
        switchMap(views => combineLatest(views.map(view => view.scrolledIntoView$.pipe(map(() => view))))),
        map(views => views.reduce((count, view) => view.scrolledIntoView ? count : count + 1, 0)),
      );
  }
}
