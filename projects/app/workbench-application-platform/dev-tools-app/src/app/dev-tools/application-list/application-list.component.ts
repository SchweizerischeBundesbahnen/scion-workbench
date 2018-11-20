/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, TrackByFunction } from '@angular/core';
import { BehaviorSubject, combineLatest, MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { Manifest, ManifestRegistryService } from '@scion/workbench-application.core';
import { map } from 'rxjs/operators';
import { toFilterRegExp } from '@scion/app/common';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
})
export class ApplicationListComponent {

  private _filter$ = new BehaviorSubject<string>(null);

  public manifests$: Observable<Manifest[]>;

  constructor(private _manifestRegistryService: ManifestRegistryService) {
    this.manifests$ = combineLatest(this._filter$, this._manifestRegistryService.manifests$)
      .pipe(
        filterManifests(),
        sortManifests()
      );
  }

  public onFilter(filterText: string): void {
    this._filter$.next(filterText);
  }

  public trackByFn: TrackByFunction<Manifest> = (index: number, manifest: Manifest): any => {
    return manifest.symbolicName;
  };
}

function filterManifests(): OperatorFunction<[string, Manifest[]], Manifest[]> {
  return map(([filter, manifests]: [string, Manifest[]]): Manifest[] => {
    if (!filter) {
      return manifests;
    }

    const filterRegExp = toFilterRegExp(filter);
    return manifests.filter(manifest => filterRegExp.test(manifest.name) || filterRegExp.test(manifest.symbolicName));
  });
}

function sortManifests(): MonoTypeOperatorFunction<Manifest[]> {
  return map((manifests: Manifest[]): Manifest[] => [...manifests].sort((mf1, mf2) => mf1.name.localeCompare(mf2.name)));
}
