/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, TrackByFunction } from '@angular/core';
import { BehaviorSubject, combineLatest, MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { PlatformCapabilityTypes, Capability, Manifest, ManifestRegistryService, Qualifier } from '@scion/workbench-application.core';
import { map } from 'rxjs/operators';
import { PARAM_NAME, PARAM_VALUE, SciParamsEnterComponent, toFilterRegExp } from '@scion/app/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

const CAPABILITY_LOOKUP_TYPE = 'type';
const CAPABILITY_LOOKUP_QUALIFIER = 'qualifier';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.scss'],
})
export class DevToolsComponent {

  public readonly CAPABILITY_LOOKUP_TYPE = CAPABILITY_LOOKUP_TYPE;
  public readonly CAPABILITY_LOOKUP_QUALIFIER = CAPABILITY_LOOKUP_QUALIFIER;

  public readonly PlatformCapabilityTypes = PlatformCapabilityTypes;

  public form: FormGroup;
  public manifests$: Observable<Manifest[]>;

  public appListPanelExpanded = true;
  public capabilityLookupPanelExpanded = false;
  public capabilityLookupResult$: Observable<Capability[]>;

  private _appListFilter$ = new BehaviorSubject<string>(null);

  constructor(formBuilder: FormBuilder, private _manifestRegistryService: ManifestRegistryService) {
    this.form = formBuilder.group({
      [CAPABILITY_LOOKUP_TYPE]: formBuilder.control([], Validators.required),
      [CAPABILITY_LOOKUP_QUALIFIER]: formBuilder.array([
        formBuilder.group({
          [PARAM_NAME]: formBuilder.control('*'),
          [PARAM_VALUE]: formBuilder.control('*'),
        })
      ]),
    });

    this.manifests$ = combineLatest([this._appListFilter$, this._manifestRegistryService.manifests$])
      .pipe(
        filterManifests(),
        sortManifests(),
      );
  }

  public onLookupClick(): void {
    const type = this.form.get(CAPABILITY_LOOKUP_TYPE).value;
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(CAPABILITY_LOOKUP_QUALIFIER) as FormArray);
    this.capabilityLookupResult$ = this._manifestRegistryService.capabilities$(type, qualifier);
  }

  public toggleAppListPanel(): void {
    this.appListPanelExpanded = !this.appListPanelExpanded;
  }

  public toggleCapabilityLookupPanel(): void {
    this.capabilityLookupPanelExpanded = !this.capabilityLookupPanelExpanded;
  }

  public onFilter(filterText: string): void {
    this._appListFilter$.next(filterText);
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
