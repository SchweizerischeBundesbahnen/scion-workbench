/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, HostBinding, HostListener, inject, viewChild} from '@angular/core';
import {PartId, WorkbenchConfig, WorkbenchRouteData, WorkbenchRouter, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {ManifestService} from '@scion/microfrontend-platform';
import {Observable} from 'rxjs';
import {WorkbenchCapabilities, WorkbenchRouter as WorkbenchClientRouter, WorkbenchViewCapability} from '@scion/workbench-client';
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

  private readonly _view = inject(WorkbenchView, {optional: true}); // not available on entry point page
  private readonly _workbenchClientRouter = inject(WorkbenchClientRouter, {optional: true}); // not available if starting the workbench standalone
  private readonly _manifestService = inject(ManifestService, {optional: true}); // not available if starting the workbench standalone
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _cd = inject(ChangeDetectorRef);
  private readonly _filterField = viewChild.required(SciFilterFieldComponent);

  protected readonly WorkbenchRouteData = WorkbenchRouteData;
  protected readonly filterControl = inject(NonNullableFormBuilder).control('');
  protected readonly workbenchViewRoutes: Routes;
  protected readonly microfrontendViewCapabilities$: Observable<WorkbenchViewCapability[]> | undefined;

  @HostBinding('attr.data-partid')
  protected partId: PartId | undefined;

  constructor() {
    const workbenchConfig = inject(WorkbenchConfig);

    // Read views to be pinned to the desktop.
    this.workbenchViewRoutes = inject(Router).config
      .filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET)
      .flatMap(route => findPinToDesktopRoutes(route));

    if (workbenchConfig.microfrontendPlatform) {
      // Read microfrontend views to be pinned to the desktop.
      this.microfrontendViewCapabilities$ = this._manifestService!.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
        .pipe(
          filterArray(viewCapability => 'pinToDesktop' in viewCapability.properties && !!viewCapability.properties['pinToDesktop']),
          sortArray((a, b) => a.metadata!.appSymbolicName.localeCompare(b.metadata!.appSymbolicName)),
        );
    }

    this.installFilterFieldDisplayTextSynchronizer();
    this.memoizeContextualPart();
  }

  protected onViewOpen(path: string, event: MouseEvent): void {
    event.preventDefault(); // Prevent href navigation imposed by accessibility rules
    void this._workbenchRouter.navigate([path], {
      target: event.ctrlKey ? 'blank' : this._view?.id ?? 'blank',
      activate: !event.ctrlKey,
    });
  }

  protected onMicrofrontendViewOpen(viewCapability: WorkbenchViewCapability, event: MouseEvent): void {
    event.preventDefault(); // Prevent href navigation imposed by accessibility rules
    void this._workbenchClientRouter!.navigate(viewCapability.qualifier, {
      target: event.ctrlKey ? 'blank' : this._view?.id ?? 'blank',
      activate: !event.ctrlKey,
    });
  }

  @HostListener('keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    this._filterField().focusAndApplyKeyboardEvent(event);
  }

  /**
   * Returns `true` if in the context of the welcome page.
   */
  protected isWelcomePage(): boolean {
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
      this.partId = this._view?.part().id ?? this._workbenchService.parts().filter(part => part.active()).sort(a => a.peripheral() ? 1 : -1).at(0)?.id;
      this._cd.markForCheck();
    });
  }

  public selectViewCapabilityText = (viewCapability: WorkbenchViewCapability): string | undefined => {
    return viewCapability.properties.title;
  };

  public selectViewRouteText = (route: Route): string | undefined => {
    return route.data?.[WorkbenchRouteData.title] as string | undefined;
  };
}

/**
 * Finds routes to be pinned to the desktop.
 */
function findPinToDesktopRoutes(route: Route): Routes {
  if (route.children) {
    return route.children.flatMap(findPinToDesktopRoutes);
  }
  if (route.data?.['pinToDesktop'] === true) {
    return [route];
  }
  return [];
}
