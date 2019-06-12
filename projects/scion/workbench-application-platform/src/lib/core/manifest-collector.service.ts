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
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { ApplicationConfig, ApplicationManifest, PlatformConfig, PlatformConfigLoader } from './metadata';
import { ApplicationRegistry } from './application-registry.service';
import { Logger } from './logger.service';
import { ManifestRegistry } from './manifest-registry.service';
import { PlatformProperties } from './platform-properties.service';
import { Defined } from './defined.util';

/**
 * Collects manifests of registered applications and registers application capabilities and intents.
 */
@Injectable()
export class ManifestCollector implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _collectPromise: Promise<ManifestRegistry>;

  constructor(private _platformConfigLoader: PlatformConfigLoader,
              private _httpClient: HttpClient,
              private _applicationRegistry: ApplicationRegistry,
              private _manifestRegistry: ManifestRegistry,
              private _platformProperties: PlatformProperties,
              private _logger: Logger) {
  }

  /**
   * Starts collecting manifests of registered applications and registers application capabilities and intents.
   *
   * @return Promise to wait until collecting manifests completes.
   */
  public collectAndRegister(): Promise<void> {
    return this._collectPromise || (this._collectPromise = this.collect()).then(() => undefined);
  }

  /**
   * Returns a promise which resolves upon manifest collection completed.
   */
  public get whenManifests(): Promise<ManifestRegistry> {
    return this._collectPromise;
  }

  private collect(): Promise<ManifestRegistry> {
    const applicationManifests$: Observable<ApplicationManifest[]> = this._platformConfigLoader.load$().pipe(
      tap(platformConfig => {
        Defined.orElseThrow(platformConfig, () => Error('[PlatformConfigError] No platform config provided.'));
        Defined.orElseThrow(platformConfig.apps, () => Error('[PlatformConfigError] Missing \'apps\' property in platform config. Did you forget to register applications?'));
      }),
      tap(platformConfig => {
        this._platformProperties.registerProperties(platformConfig.properties);
      }),
      mergeMap((platformConfig: PlatformConfig): Observable<ApplicationManifest[]> => {
        return forkJoin(platformConfig.apps
          .filter(app => !app.exclude)
          .map((app: ApplicationConfig): Observable<ApplicationManifest> => {
            return this._httpClient.get<ApplicationManifest>(app.manifestUrl).pipe(
              tap((applicationManifest: ApplicationManifest) => {
                this._applicationRegistry.registerApplication(app, applicationManifest);
                this._logger.info(`Application '${app.symbolicName}' registered as workbench application`, this._applicationRegistry.getApplication(app.symbolicName));
              }),
              catchError(error => {
                this._logger.warn(`Application '${app.symbolicName}' is not available.`, app, error);
                return of(undefined); // do not use {EMPTY}, otherwise 'forkJoin' would not wait for all Observables to complete.
              }),
            );
          }));
      }),
    );

    return applicationManifests$
      .pipe(takeUntil(this._destroy$))
      .toPromise()
      .then(() => this._manifestRegistry);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
