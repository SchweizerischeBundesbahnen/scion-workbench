/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Signal} from '@angular/core';
import {AddPartsComponent, PartDescriptor} from '../tables/add-parts/add-parts.component';
import {AddViewsComponent, ViewDescriptor} from '../tables/add-views/add-views.component';
import {NavigateViewsComponent, NavigationDescriptor} from '../tables/navigate-views/navigate-views.component';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SettingsService} from '../../settings.service';
import {WorkbenchPart, WorkbenchRouter, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {stringifyError} from '../../common/stringify-error.util';
import {toSignal} from '@angular/core/rxjs-interop';
import {NavigatePartsComponent} from '../tables/navigate-parts/navigate-parts.component';

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
    NavigatePartsComponent,
  ],
})
export default class ModifyLayoutPageComponent {

  protected form = this._formBuilder.group({
    parts: this._formBuilder.control<PartDescriptor[]>([]),
    views: this._formBuilder.control<ViewDescriptor[]>([]),
    partNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
    viewNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
  });

  protected modifyError: string | false | undefined;
  protected partProposals: Signal<string[]>;
  protected viewProposals: Signal<string[]>;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              private _workbenchRouter: WorkbenchRouter) {
    this.partProposals = this.computePartProposals();
    this.viewProposals = this.computeViewProposals();
  }

  private computePartProposals(): Signal<string[]> {
    const partsFromUI = toSignal(this.form.controls.parts.valueChanges, {initialValue: []});
    const workbenchService = inject(WorkbenchService);

    return computed(() => new Array<WorkbenchPart | PartDescriptor>()
      .concat(workbenchService.parts())
      .concat(partsFromUI())
      .map(part => part.id)
      .filter(Boolean)
      .reduce((acc, partId) => acc.includes(partId) ? acc : acc.concat(partId), new Array<string>()),
    );
  }

  private computeViewProposals(): Signal<string[]> {
    const viewsFromUI = toSignal(this.form.controls.views.valueChanges, {initialValue: []});
    const workbenchService = inject(WorkbenchService);

    return computed(() => new Array<WorkbenchView | ViewDescriptor>()
      .concat(workbenchService.views())
      .concat(viewsFromUI())
      .map(view => view.id)
      .filter(Boolean)
      .reduce((acc, viewId) => acc.includes(viewId) ? acc : acc.concat(viewId), new Array<string>()),
    );
  }

  protected async onModify(): Promise<void> {
    this.modifyError = undefined;
    this.navigate()
      .then(success => success ? Promise.resolve() : Promise.reject(Error('Modification failed')))
      .then(() => this.resetForm())
      .catch((error: unknown) => this.modifyError = stringifyError(error));
  }

  private navigate(): Promise<boolean> {
    return this._workbenchRouter.navigate(layout => {
      // Add parts.
      for (const part of this.form.controls.parts.value) {
        layout = layout.addPart(part.id, {
          relativeTo: part.relativeTo.relativeTo,
          align: part.relativeTo.align!,
          ratio: part.relativeTo.ratio!,
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

      // Add part navigations.
      for (const partNavigation of this.form.controls.partNavigations.value) {
        layout = layout.navigatePart(partNavigation.id, partNavigation.commands, {
          hint: partNavigation.extras?.hint,
          data: partNavigation.extras?.data,
          state: partNavigation.extras?.state,
          cssClass: partNavigation.extras?.cssClass,
        });
      }

      // Add view navigations.
      for (const viewNavigation of this.form.controls.viewNavigations.value) {
        layout = layout.navigateView(viewNavigation.id, viewNavigation.commands, {
          hint: viewNavigation.extras?.hint,
          data: viewNavigation.extras?.data,
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
