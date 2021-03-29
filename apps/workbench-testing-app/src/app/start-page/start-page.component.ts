/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, Optional, ViewChild } from '@angular/core';
import { WorkbenchModuleConfig, WorkbenchView } from '@scion/workbench';
import { ManifestService, PlatformPropertyService } from '@scion/microfrontend-platform';
import { Observable, of, Subject } from 'rxjs';
import { WorkbenchCapabilities, WorkbenchRouter, WorkbenchViewCapability } from '@scion/workbench-client';
import { filterArray, sortArray } from '@scion/toolkit/operators';
import { WorkbenchStartupQueryParams } from '../workbench/workbench-startup-query-params';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router, Routes } from '@angular/router';
import { expand, filter, mapTo, take, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { SciFilterFieldComponent, toFilterRegExp } from '@scion/toolkit.internal/widgets';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartPageComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  public filterControl = new FormControl('');

  public workbenchViewRoutes$: Observable<Routes>;
  public microfrontendViewCapabilities$: Observable<WorkbenchViewCapability[]>;

  @ViewChild(SciFilterFieldComponent)
  private _filterField: SciFilterFieldComponent;

  constructor(@Optional() private _view: WorkbenchView, // not available on entry point page
              @Optional() private _workbenchClientRouter: WorkbenchRouter, // not available when starting the workbench standalone
              @Optional() private _manifestService: ManifestService, // not available when starting the workbench standalone
              @Optional() private _propertyService: PlatformPropertyService, // not available when starting the workbench standalone
              private _host: ElementRef<HTMLElement>,
              router: Router,
              route: ActivatedRoute,
              cd: ChangeDetectorRef,
              workbenchModuleConfig: WorkbenchModuleConfig) {
    if (this._view) {
      this._view.title = route.snapshot.data['title'];
      this._view.heading = route.snapshot.data['heading'];
      this._view.cssClass = route.snapshot.data['cssClass'];
    }

    // Read workbench views to be pinned to the start page.
    this.workbenchViewRoutes$ = of(router.config)
      .pipe(
        filterArray(it => (!it.outlet || it.outlet === PRIMARY_OUTLET) && it.data && it.data['pinToStartPage'] === true),
        expand(it => this.filterControl.valueChanges.pipe(take(1), mapTo(it))),
        filterArray(it => !this.filterControl.value || it.data['title'].match(toFilterRegExp(this.filterControl.value)) !== null),
      );

    // Read microfrontend views to be pinned to the start page.
    if (workbenchModuleConfig.microfrontends) {
      this.microfrontendViewCapabilities$ = this._manifestService.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
        .pipe(
          filterArray(viewCapability => viewCapability?.properties['pinToStartPage'] === true),
          expand(viewCapabilities => this.filterControl.valueChanges.pipe(take(1), mapTo(viewCapabilities))),
          filterArray(viewCapability => !this.filterControl.value || viewCapability?.properties.title?.match(toFilterRegExp(this.filterControl.value)) !== null),
          sortArray((a, b) => a.metadata.appSymbolicName.localeCompare(b.metadata.appSymbolicName)),
        );
    }

    // Set configured app colors as CSS variables.
    if (workbenchModuleConfig.microfrontends) {
      this.setAppColorCssVariables();
    }

    this.markForCheckOnUrlChange(router, cd);
    this.installFilterFieldDisplayTextSynchronizer();
  }

  public onMicrofrontendViewOpen(viewCapability: WorkbenchViewCapability): void {
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

  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    this._filterField.focusAndApplyKeyboardEvent(event);
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

  public concat(...cssClass: Array<undefined | string | string[]>): string[] {
    return cssClass.reduce((acc: string[], it: string | string[]) => acc.concat(it || []), new Array<string>()) as string[];
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
   * Sets configured app colors as CSS variables:
   *
   * --workbench-client-testing-app1-color
   * --workbench-client-testing-app2-color
   *
   * Colors are defined in platform properties in {@link environment.microfrontendConfig}.
   */
  private setAppColorCssVariables(): void {
    this._manifestService.applications.forEach(app => {
      const appColor = this._propertyService.get(app.symbolicName, null)?.color;
      appColor && this._host.nativeElement.style.setProperty(`--${app.symbolicName}-color`, appColor);
    });
  }

  /**
   * Returns `true` if in the context of the welcome page.
   */
  public isWelcomePage(): boolean {
    return !this._view;
  }

  /**
   * Synchronizes the filter's display text across tab boundaries.
   */
  private installFilterFieldDisplayTextSynchronizer(): void {
    this.filterControl.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.filterControl.setValue(value, {emitEvent: false});
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
