/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, Optional } from '@angular/core';
import { WorkbenchView } from '@scion/workbench';
import { ManifestService } from '@scion/microfrontend-platform';
import { Observable, Subject } from 'rxjs';
import { ViewCapability, WorkbenchRouter } from '@scion/workbench-client';
import { filterArray } from '@scion/toolkit/operators';
import { WorkbenchStartupQueryParams } from '../workbench/workbench-startup-query-params';
import { ActivatedRoute, NavigationEnd, Router, Routes } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartPageComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public workbenchViewRoutes: Routes = [];
  public microfrontendViewCapabilities$ = new Observable<ViewCapability[]>();

  constructor(@Optional() private _view: WorkbenchView, // not available on entry point page
              @Optional() private _workbenchClientRouter: WorkbenchRouter, // not available when starting the workbench standalone
              @Optional() manifestService: ManifestService, // not available when starting the workbench standalone
              router: Router,
              route: ActivatedRoute,
              cd: ChangeDetectorRef) {
    this.markForCheckOnUrlChange(router, cd);

    if (this._view) {
      this._view.title = route.snapshot.data['title'];
      this._view.heading = route.snapshot.data['heading'];
      this._view.cssClass = route.snapshot.data['cssClass'];
    }
    this.microfrontendViewCapabilities$ = manifestService?.lookupCapabilities$<ViewCapability>({type: 'view', qualifier: {'*': '*'}})
      .pipe(filterArray(viewCapability => viewCapability.properties['pinToStartPage'] === true));
    this.workbenchViewRoutes = router.config
      .filter(it => !it.outlet && it.data && it.data['pinToStartPage']);
  }

  public onMicrofrontendViewOpen(viewCapability: ViewCapability): void {
    const qualifier = {...viewCapability.qualifier};

    // Replace wildcard qualifier entries as intents must be exact, thus not contain wildcards.
    Object.entries(qualifier).forEach(([key, value]) => {
      if (key === '*' || value === '?') {
        delete qualifier[key];
      }
      else if (value === '*') {
        qualifier[key] = `:${key}`;
      }
    });
    this._workbenchClientRouter.navigate(qualifier, {activateIfPresent: false, selfViewId: this._view?.viewId});
  }

  /**
   * Computes the URL to launch a new app instance with given startup options, preserving the current workbench layout.
   */
  public computeAppUrl(options: { launcher: 'APP_INITIALIZER' | 'LAZY', standalone: boolean }): string {
    const href = new URL(location.href);
    href.searchParams.append(WorkbenchStartupQueryParams.LAUNCHER_QUERY_PARAM, options.launcher);
    href.searchParams.append(WorkbenchStartupQueryParams.STANDALONE_QUERY_PARAM, `${options.standalone}`);
    return href.toString();
  }

  private markForCheckOnUrlChange(router: Router, cd: ChangeDetectorRef): void {
    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        cd.markForCheck();
      });
  }

  /**
   * Returns `true` if in the context of the welcome page.
   */
  public isWelcomePage(): boolean {
    return !this._view;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
