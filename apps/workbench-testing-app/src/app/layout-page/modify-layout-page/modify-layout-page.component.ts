/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {AddPartsComponent, PartDescriptor} from '../tables/add-parts/add-parts.component';
import {AddViewsComponent, ViewDescriptor} from '../tables/add-views/add-views.component';
import {NavigateViewsComponent, NavigationDescriptor} from '../tables/navigate-views/navigate-views.component';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SettingsService} from '../../settings.service';
import {WorkbenchRouter, WorkbenchService} from '@scion/workbench';
import {stringifyError} from '../../common/stringify-error.util';
import {combineLatestWith, Observable} from 'rxjs';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-modify-layout-page',
  templateUrl: './modify-layout-page.component.html',
  styleUrls: ['./modify-layout-page.component.scss'],
  standalone: true,
  imports: [
    AddPartsComponent,
    AddViewsComponent,
    NavigateViewsComponent,
    ReactiveFormsModule,
    AsyncPipe,
  ],
})
export default class ModifyLayoutPageComponent {

  protected form = this._formBuilder.group({
    parts: this._formBuilder.control<PartDescriptor[]>([]),
    views: this._formBuilder.control<ViewDescriptor[]>([]),
    viewNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
  });

  protected modifyError: string | false | undefined;
  protected partProposals$: Observable<string[]>;
  protected viewProposals$: Observable<string[]>;

  constructor(workbenchService: WorkbenchService,
              private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              private _workbenchRouter: WorkbenchRouter) {
    this.partProposals$ = workbenchService.parts$
      .pipe(
        combineLatestWith(this.form.controls.parts.valueChanges.pipe(startWith([]))),
        map(([a, b]) => [...a, ...b]),
        mapArray(part => part.id),
        filterArray(partId => !!partId),
      );
    this.viewProposals$ = workbenchService.views$
      .pipe(
        combineLatestWith(this.form.controls.views.valueChanges.pipe(startWith([]))),
        map(([a, b]) => [...a, ...b]),
        mapArray(view => view.id),
        filterArray(viewId => !!viewId),
      );
  }

  protected async onModify(): Promise<void> {
    this.modifyError = undefined;
    this.navigate()
      .then(success => success ? Promise.resolve() : Promise.reject('Modification failed'))
      .then(() => this.resetForm())
      .catch(error => this.modifyError = stringifyError(error));
  }

  private navigate(): Promise<boolean> {
    return this._workbenchRouter.navigate(layout => {
      // Add parts.
      for (const part of this.form.controls.parts.value) {
        layout = layout.addPart(part.id, {
          relativeTo: part.relativeTo!.relativeTo,
          align: part.relativeTo!.align!,
          ratio: part.relativeTo!.ratio!,
        }, {activate: part.options?.activate});
      }

      // Add views.
      for (const view of this.form.controls.views.value) {
        layout = layout.addView(view.id, {
          partId: view.options.partId,
          position: view.options.position,
          activateView: view.options.activateView,
          activatePart: view.options.activatePart,
          cssClass: view.options.cssClass,
        });
      }

      // Add navigations.
      for (const viewNavigation of this.form.controls.viewNavigations.value) {
        layout = layout.navigateView(viewNavigation.id, viewNavigation.commands, {
          hint: viewNavigation.extras?.hint,
          state: viewNavigation.extras?.state,
          cssClass: viewNavigation.extras?.cssClass,
        });
      }

      return layout;
    });
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
    }
  }
}
