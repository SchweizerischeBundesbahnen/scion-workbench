/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener, Optional, ViewChild} from '@angular/core';
import {WorkbenchConfig, WorkbenchRouteData, WorkbenchRouter, WorkbenchRouterLinkDirective, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {Capability, IntentClient, ManifestService} from '@scion/microfrontend-platform';
import {Observable, of} from 'rxjs';
import {WorkbenchCapabilities, WorkbenchPopupService as WorkbenchClientPopupService, WorkbenchRouter as WorkbenchClientRouter, WorkbenchViewCapability} from '@scion/workbench-client';
import {filterArray, sortArray} from '@scion/toolkit/operators';
import {NavigationEnd, PRIMARY_OUTLET, Route, Router, Routes} from '@angular/router';
import {filter} from 'rxjs/operators';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFilterFieldComponent} from '@scion/components.internal/filter-field';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {FilterPipe} from '../common/filter.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ArrayConcatPipe} from '../common/array-concat.pipe';
import {SciTabbarComponent, SciTabDirective} from '@scion/components.internal/tabbar';

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
    SciFilterFieldComponent,
    SciTabbarComponent,
    SciTabDirective,
    FilterPipe,
    ArrayConcatPipe,
    WorkbenchRouterLinkDirective,
  ],
})
export default class StartPageComponent {

  @ViewChild(SciFilterFieldComponent)
  private _filterField!: SciFilterFieldComponent;

  @HostBinding('attr.data-partid')
  public partId: string | undefined;

  public filterControl = this._formBuilder.control('');
  public workbenchViewRoutes$: Observable<Routes>;
  public microfrontendViewCapabilities$: Observable<WorkbenchViewCapability[]> | undefined;
  public testCapabilities$: Observable<Capability[]> | undefined;

  public WorkbenchRouteData = WorkbenchRouteData;

  constructor(@Optional() private _view: WorkbenchView | null, // not available on entry point page
              @Optional() private _workbenchClientRouter: WorkbenchClientRouter | null, // not available when starting the workbench standalone
              @Optional() private _intentClient: IntentClient | null, // not available when starting the workbench standalone
              @Optional() private _manifestService: ManifestService | null, // not available when starting the workbench standalone
              @Optional() private _workbenchClientPopupService: WorkbenchClientPopupService | null, // not available when starting the workbench standalone
              private _workbenchService: WorkbenchService,
              private _workbenchRouter: WorkbenchRouter,
              private _formBuilder: NonNullableFormBuilder,
              router: Router,
              cd: ChangeDetectorRef,
              workbenchConfig: WorkbenchConfig) {
    // Read workbench views to be pinned to the start page.
    this.workbenchViewRoutes$ = of(router.config)
      .pipe(filterArray(route => {
        if ((!route.outlet || route.outlet === PRIMARY_OUTLET)) {
          return route.data?.['pinToStartPage'] === true;
        }
        return false;
      }));

    if (workbenchConfig.microfrontendPlatform) {
      // Read microfrontend views to be pinned to the start page.
      this.microfrontendViewCapabilities$ = this._manifestService!.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
        .pipe(
          filterArray(viewCapability => 'pinToStartPage' in viewCapability.properties && !!viewCapability.properties['pinToStartPage']),
          filterArray(viewCapability => !isTestCapability(viewCapability)),
          sortArray((a, b) => a.metadata!.appSymbolicName.localeCompare(b.metadata!.appSymbolicName)),
        );
      // Read test capabilities to be pinned to the start page.
      this.testCapabilities$ = this._manifestService!.lookupCapabilities$()
        .pipe(
          filterArray(capability => !!capability.properties && 'pinToStartPage' in capability.properties && !!capability.properties['pinToStartPage']),
          filterArray(viewCapability => isTestCapability(viewCapability)),
          sortArray((a, b) => a.metadata!.appSymbolicName.localeCompare(b.metadata!.appSymbolicName)),
        );
    }

    this.markForCheckOnUrlChange(router, cd);
    this.installFilterFieldDisplayTextSynchronizer();
    this.memoizeContextualPart();
  }

  public onViewOpen(path: string, event: MouseEvent): void {
    event.preventDefault(); // Prevent href navigation imposed by accessibility rules
    this._workbenchRouter.navigate([path], {
      target: event.ctrlKey ? 'blank' : this._view?.id ?? 'blank',
      activate: !event.ctrlKey,
    }).then();
  }

  public onMicrofrontendViewOpen(viewCapability: WorkbenchViewCapability, event: MouseEvent): void {
    event.preventDefault(); // Prevent href navigation imposed by accessibility rules
    this._workbenchClientRouter!.navigate(viewCapability.qualifier, {
      target: event.ctrlKey ? 'blank' : this._view?.id ?? 'blank',
      activate: !event.ctrlKey,
    }).then();
  }

  public async onTestCapabilityOpen(testCapability: Capability, event: MouseEvent): Promise<void> {
    event.preventDefault(); // Prevent href navigation imposed by accessibility rules
    // TODO [#343] Remove switch-case after fixed issue https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/343
    switch (testCapability.type) {
      case WorkbenchCapabilities.View: {
        await this._workbenchClientRouter!.navigate(testCapability.qualifier!, {target: this._view?.id});
        break;
      }
      case WorkbenchCapabilities.Popup: {
        await this._workbenchClientPopupService!.open(testCapability.qualifier!, {anchor: event});
        break;
      }
      default: {
        await this._intentClient!.publish({type: testCapability.type, qualifier: testCapability.qualifier});
        break;
      }
    }
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    this._filterField.focusAndApplyKeyboardEvent(event);
  }

  private markForCheckOnUrlChange(router: Router, cd: ChangeDetectorRef): void {
    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
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

  /**
   * Synchronizes the filter's display text across tab boundaries.
   */
  private installFilterFieldDisplayTextSynchronizer(): void {
    this.filterControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.filterControl.setValue(value, {emitEvent: false});
      });
  }

  /**
   * Memoizes the part in which this component is displayed.
   */
  private memoizeContextualPart(): void {
    this._workbenchService.layout$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.partId = this._view?.part.id ?? this._workbenchService.parts.filter(part => part.active).sort(a => a.isInMainArea ? -1 : 1).at(0)?.id;
      });
  }

  public selectViewCapabilityText = (viewCapability: WorkbenchViewCapability): string | undefined => {
    return viewCapability.properties!.title;
  };

  public selectTestCapabilityText = (testCapability: Capability): string | undefined => {
    return testCapability.properties?.['cssClass'];
  };

  public selectViewRouteText = (route: Route): string | undefined => {
    return route.data?.[WorkbenchRouteData.title];
  };
}

function isTestCapability(capability: Capability): boolean {
  return Object.keys(capability.qualifier ?? {}).includes('test');
}
