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
import { forkJoin, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, filter, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { ApplicationConfigLoader, ApplicationManifest } from './metadata';
import { ApplicationRegistry } from './application-registry.service';
import { Logger } from './logger.service';
import { ManifestRegistry } from './manifest-registry.service';

/**
 * Collects manifests of registered applications and registers application capabilities and intents.
 */
@Injectable()
export class ManifestCollector implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _collectPromise: Promise<ManifestRegistry>;


  constructor(private _applicationConfigLoader: ApplicationConfigLoader,
              private _httpClient: HttpClient,
              private _applicationRegistry: ApplicationRegistry,
              private _manifestRegistry: ManifestRegistry,
              private _logger: Logger) {
  }

  /**
   * Starts collecting manifests of registered applications and registers application capabilities and intents.
   *
   * @return Promise to wait until collecting manifests completes.
   */
  public collectAndRegister(): Promise<ManifestRegistry> {
    return this._collectPromise || (this._collectPromise = this.collect());
  }

  /**
   * Returns a promise which resolves upon manifest collection completed.
   */
  public get whenManifests(): Promise<ManifestRegistry> {
    return this._collectPromise;
  }

  private collect(): Promise<ManifestRegistry> {
    const applicationManifests$ = this._applicationConfigLoader.load$()
      .pipe(
        mergeMap(appConfigurations => of(...appConfigurations)),
        filter(appConfig => !appConfig.exclude),
        mergeMap(appConfig => {
          // fetch the manifest
          return this._httpClient.get<ApplicationManifest>(appConfig.manifestUrl).pipe(
            tap((applicationManifest: ApplicationManifest) => {
              this._applicationRegistry.registerApplication(appConfig, applicationManifest);
              this._logger.info(`Application '${appConfig.symbolicName}' registered as workbench application`, this._applicationRegistry.getApplication(appConfig.symbolicName));
            }),
            catchError(error => {
              this._logger.warn(`Application '${appConfig.symbolicName}' is not available.`, appConfig, error);
              return of(undefined); // do not use {EMPTY}, otherwise 'forkJoin' would not wait for all Observables to complete.
            }),
          );
        })
      );

    return forkJoin(applicationManifests$)
      .pipe(takeUntil(this._destroy$))
      .toPromise()
      .then(() => this._manifestRegistry);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
