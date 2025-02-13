/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, HostBinding, HostListener, Optional, ViewChild} from '@angular/core';
import {PartId, WorkbenchConfig, WorkbenchRouteData, WorkbenchRouter, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {Capability, IntentClient, ManifestService} from '@scion/microfrontend-platform';
import {Observable, of} from 'rxjs';
import {WorkbenchCapabilities, WorkbenchPopupService as WorkbenchClientPopupService, WorkbenchRouter as WorkbenchClientRouter, WorkbenchViewCapability} from '@scion/workbench-client';
import {filterArray, sortArray} from '@scion/toolkit/operators';
import {PRIMARY_OUTLET, Route, Router, Routes} from '@angular/router';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFilterFieldComponent} from '@scion/components.internal/filter-field';
import {AsyncPipe, NgClass} from '@angular/common';
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
    NgClass,
    AsyncPipe,
    ReactiveFormsModule,
    NullIfEmptyPipe,
    SciFilterFieldComponent,
    SciTabbarComponent,
    SciTabDirective,
    FilterPipe,
    ArrayConcatPipe,
  ],
})
export default class StartPageComponent {

  @ViewChild(SciFilterFieldComponent)
  private _filterField!: SciFilterFieldComponent;

  @HostBinding('attr.data-partid')
  public partId: PartId | undefined;

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
              private _cd: ChangeDetectorRef,
              router: Router,
              workbenchConfig: WorkbenchConfig) {
    // Read views to be pinned to the desktop.
    this.workbenchViewRoutes$ = of(router.config)
      .pipe(filterArray(route => {
        if ((!route.outlet || route.outlet === PRIMARY_OUTLET)) {
          return route.data?.['pinToDesktop'] === true;
        }
        return false;
      }));

    if (workbenchConfig.microfrontendPlatform) {
      // Read microfrontend views to be pinned to the desktop.
      this.microfrontendViewCapabilities$ = this._manifestService!.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
        .pipe(
          filterArray(viewCapability => 'pinToDesktop' in viewCapability.properties && !!viewCapability.properties['pinToDesktop']),
          filterArray(viewCapability => !isTestCapability(viewCapability)),
          sortArray((a, b) => a.metadata!.appSymbolicName.localeCompare(b.metadata!.appSymbolicName)),
        );
      // Read test capabilities to be pinned to the desktop.
      this.testCapabilities$ = this._manifestService!.lookupCapabilities$()
        .pipe(
          filterArray(capability => !!capability.properties && 'pinToDesktop' in capability.properties && !!capability.properties['pinToDesktop']),
          filterArray(viewCapability => isTestCapability(viewCapability)),
          sortArray((a, b) => a.metadata!.appSymbolicName.localeCompare(b.metadata!.appSymbolicName)),
        );
    }

    this.installFilterFieldDisplayTextSynchronizer();
    this.memoizeContextualPart();
  }

  public onViewOpen(path: string, event: MouseEvent): void {
    event.preventDefault(); // Prevent href navigation imposed by accessibility rules
    void this._workbenchRouter.navigate([path], {
      target: event.ctrlKey ? 'blank' : this._view?.id ?? 'blank',
      activate: !event.ctrlKey,
    });
  }

  public onMicrofrontendViewOpen(viewCapability: WorkbenchViewCapability, event: MouseEvent): void {
    event.preventDefault(); // Prevent href navigation imposed by accessibility rules
    void this._workbenchClientRouter!.navigate(viewCapability.qualifier, {
      target: event.ctrlKey ? 'blank' : this._view?.id ?? 'blank',
      activate: !event.ctrlKey,
    });
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
        await this._workbenchClientPopupService!.open(testCapability.qualifier!, {anchor: event.target as HTMLElement});
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
    effect(() => {
      this.partId = this._view?.part().id ?? this._workbenchService.parts().filter(part => part.active()).sort(a => a.isInMainArea ? -1 : 1).at(0)?.id;
      this._cd.markForCheck();
    });
  }

  public selectViewCapabilityText = (viewCapability: WorkbenchViewCapability): string | undefined => {
    return viewCapability.properties.title;
  };

  public selectTestCapabilityText = (testCapability: Capability): string | undefined => {
    return testCapability.properties?.['cssClass'] as string | undefined;
  };

  public selectViewRouteText = (route: Route): string | undefined => {
    return route.data?.[WorkbenchRouteData.title] as string | undefined;
  };
}

function isTestCapability(capability: Capability): boolean {
  return Object.keys(capability.qualifier ?? {}).includes('test');
}
