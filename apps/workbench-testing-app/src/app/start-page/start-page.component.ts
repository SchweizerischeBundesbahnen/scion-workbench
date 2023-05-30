/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, Optional, ViewChild} from '@angular/core';
import {WorkbenchModuleConfig, WorkbenchRouteData, WorkbenchRouterLinkDirective, WorkbenchView} from '@scion/workbench';
import {Capability, IntentClient, ManifestService, PlatformPropertyService} from '@scion/microfrontend-platform';
import {Observable, of, Subject} from 'rxjs';
import {WorkbenchCapabilities, WorkbenchPopupService, WorkbenchRouter, WorkbenchViewCapability} from '@scion/workbench-client';
import {filterArray, sortArray} from '@scion/toolkit/operators';
import {NavigationEnd, PRIMARY_OUTLET, Route, Router, Routes} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {ReactiveFormsModule, UntypedFormControl} from '@angular/forms';
import {SciFilterFieldComponent, SciFilterFieldModule} from '@scion/components.internal/filter-field';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {SciTabbarModule} from '@scion/components.internal/tabbar';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {FilterPipe} from '../common/filter.pipe';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    ReactiveFormsModule,
    NullIfEmptyPipe,
    SciFilterFieldModule,
    SciTabbarModule,
    FilterPipe,
    WorkbenchRouterLinkDirective,
  ],
})
export default class StartPageComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  @ViewChild(SciFilterFieldComponent)
  private _filterField: SciFilterFieldComponent;

  public filterControl = new UntypedFormControl('');
  public workbenchViewRoutes$: Observable<Routes>;
  public microfrontendViewCapabilities$: Observable<WorkbenchViewCapability[]>;
  public testCapabilities$: Observable<Capability[]>;

  public WorkbenchRouteData = WorkbenchRouteData;

  constructor(@Optional() private _view: WorkbenchView, // not available on entry point page
              @Optional() private _workbenchClientRouter: WorkbenchRouter, // not available when starting the workbench standalone
              @Optional() private _workbenchPopupService: WorkbenchPopupService, // not available when starting the workbench standalone
              @Optional() private _intentClient: IntentClient, // not available when starting the workbench standalone
              @Optional() private _manifestService: ManifestService, // not available when starting the workbench standalone
              @Optional() private _propertyService: PlatformPropertyService, // not available when starting the workbench standalone
              private _host: ElementRef<HTMLElement>,
              router: Router,
              cd: ChangeDetectorRef,
              workbenchModuleConfig: WorkbenchModuleConfig) {
    // Read workbench views to be pinned to the start page.
    this.workbenchViewRoutes$ = of(router.config)
      .pipe(filterArray(it => (!it.outlet || it.outlet === PRIMARY_OUTLET) && it.data && it.data['pinToStartPage'] === true));

    if (workbenchModuleConfig.microfrontendPlatform) {
      // Read microfrontend views to be pinned to the start page.
      this.microfrontendViewCapabilities$ = this._manifestService.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
        .pipe(
          filterArray(viewCapability => viewCapability.properties['pinToStartPage'] === true),
          filterArray(viewCapability => !isTestCapability(viewCapability)),
          sortArray((a, b) => a.metadata!.appSymbolicName.localeCompare(b.metadata.appSymbolicName)),
        );
      // Read test capabilities to be pinned to the start page.
      this.testCapabilities$ = this._manifestService.lookupCapabilities$()
        .pipe(
          filterArray(capability => capability.properties?.['pinToStartPage'] === true),
          filterArray(viewCapability => isTestCapability(viewCapability)),
          sortArray((a, b) => a.metadata!.appSymbolicName.localeCompare(b.metadata.appSymbolicName)),
        );
    }

    // Set configured app colors as CSS variables.
    if (workbenchModuleConfig.microfrontendPlatform) {
      this.setAppColorCssVariables();
    }

    this.markForCheckOnUrlChange(router, cd);
    this.installFilterFieldDisplayTextSynchronizer();
  }

  public onMicrofrontendViewOpen(viewCapability: WorkbenchViewCapability): void {
    this._workbenchClientRouter.navigate(viewCapability.qualifier, {target: this._view?.id});
  }

  public async onTestCapabilityOpen(testCapability: Capability, event: MouseEvent): Promise<void> {
    // TODO [#343] Remove switch-case after fixed issue https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/343
    switch (testCapability.type) {
      case WorkbenchCapabilities.View: {
        await this._workbenchClientRouter.navigate(testCapability.qualifier, {target: this._view?.id});
        break;
      }
      case WorkbenchCapabilities.Popup: {
        await this._workbenchPopupService.open(testCapability.qualifier, {anchor: event});
        break;
      }
      default: {
        await this._intentClient.publish({type: testCapability.type, qualifier: testCapability.qualifier});
        break;
      }
    }
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    this._filterField.focusAndApplyKeyboardEvent(event);
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
   * Colors are defined in platform properties in {@link environment.microfrontendPlatformConfig}.
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

  public selectViewCapabilityText = (viewCapability: WorkbenchViewCapability): string | undefined => {
    return viewCapability.properties!.title;
  };

  public selectTestCapabilityText = (testCapability: Capability): string | undefined => {
    return testCapability.properties?.['cssClass'];
  };

  public selectViewRouteText = (route: Route): string | undefined => {
    return route.data[WorkbenchRouteData.title];
  };
}

function isTestCapability(capability: Capability): boolean {
  return Object.keys(capability.qualifier ?? {}).includes('test');
}
