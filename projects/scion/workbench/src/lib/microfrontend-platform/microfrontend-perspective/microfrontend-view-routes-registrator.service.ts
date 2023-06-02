/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, IterableDiffer, IterableDiffers, OnDestroy} from '@angular/core';
import {ManifestService} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchViewCapability} from '@scion/workbench-client';
import {Subject} from 'rxjs';
import {WorkbenchInitializer} from '../../startup/workbench-initializer';
import {takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MicrofrontendViewComponent} from '../microfrontend-view/microfrontend-view.component';
import {Arrays} from '@scion/toolkit/util';

/**
 * Registers auxiliary routes for microfrontend view capabilities.
 */
@Injectable()
export class MicrofrontendViewRoutesRegistrator implements WorkbenchInitializer, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewsDiffer: IterableDiffer<WorkbenchViewCapability>;

  constructor(private _manifestService: ManifestService,
              private _router: Router,
              differs: IterableDiffers) {
    this._viewsDiffer = differs.find([]).create<WorkbenchViewCapability>((index, viewCapability) => viewCapability.metadata!.id);
  }

  public async init(): Promise<void> {
    this._manifestService.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
      .pipe(takeUntil(this._destroy$))
      .subscribe(viewCapabilities => {
        this.registerAuxiliaryRoutes(viewCapabilities);
      });
  }

  private registerAuxiliaryRoutes(viewCapabilities: WorkbenchViewCapability[]): void {
    const routes = [...this._router.config];

    const changes = this._viewsDiffer.diff(viewCapabilities);
    changes?.forEachRemovedItem(({item: viewCapability}) => {
      Arrays.remove(routes, route => route.outlet === viewCapability.metadata!.id);
    });

    changes?.forEachAddedItem(({item: viewCapability}) => {
      routes.push({
        path: '',
        outlet: viewCapability.metadata!.id,
        component: MicrofrontendViewComponent,
      });
    });

    // Note:
    //   - Do not use Router.resetConfig(...) which would destroy any currently routed component because copying all routes
    // TODO[mfp-perspective] make router util and replace with WorkbenchAuxiliaryRoutesRegistrator
    this._router.config.splice(0, this._router.config.length, ...routes);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
