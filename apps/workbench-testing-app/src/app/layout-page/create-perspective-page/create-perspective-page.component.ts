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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SettingsService} from '../../settings.service';
import {WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchLayoutFn, WorkbenchService} from '@scion/workbench';
import {stringifyError} from '../../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {Observable} from 'rxjs';
import {mapArray} from '@scion/toolkit/operators';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-create-perspective-page',
  templateUrl: './create-perspective-page.component.html',
  styleUrls: ['./create-perspective-page.component.scss'],
  standalone: true,
  imports: [
    AddPartsComponent,
    AddViewsComponent,
    NavigateViewsComponent,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
    AsyncPipe,
  ],
})
export default class CreatePerspectivePageComponent {

  protected form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
    transient: this._formBuilder.control<boolean | undefined>(undefined),
    data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    parts: this._formBuilder.control<PartDescriptor[]>([], Validators.required),
    views: this._formBuilder.control<ViewDescriptor[]>([]),
    viewNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
  });

  protected registerError: string | false | undefined;
  protected partProposals$: Observable<string[]>;
  protected viewProposals$: Observable<string[]>;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              private _workbenchService: WorkbenchService) {
    this.partProposals$ = this.form.controls.parts.valueChanges
      .pipe(mapArray(part => part.id));
    this.viewProposals$ = this.form.controls.views.valueChanges
      .pipe(mapArray(view => view.id));
  }

  protected async onRegister(): Promise<void> {
    this.registerError = undefined;
    try {
      await this._workbenchService.registerPerspective({
        id: this.form.controls.id.value,
        transient: this.form.controls.transient.value || undefined,
        data: SciKeyValueFieldComponent.toDictionary(this.form.controls.data) ?? undefined,
        layout: this.createLayout(),
      });
      this.registerError = false;
      this.resetForm();
    }
    catch (error) {
      this.registerError = stringifyError(error);
    }
  }

  private createLayout(): WorkbenchLayoutFn {
    // Capture form values, since the `layout` function is evaluated independently of the form life-cycle
    const [initialPart, ...parts] = this.form.controls.parts.value;
    const views = this.form.controls.views.value;
    const viewNavigations = this.form.controls.viewNavigations.value;

    return (factory: WorkbenchLayoutFactory): WorkbenchLayout => {
      // Add initial part.
      let layout = factory.addPart(initialPart.id, {
        activate: initialPart.options?.activate,
      });

      // Add other parts.
      for (const part of parts) {
        layout = layout.addPart(part.id, {
          relativeTo: part.relativeTo!.relativeTo,
          align: part.relativeTo!.align!,
          ratio: part.relativeTo!.ratio,
        }, {activate: part.options?.activate});
      }

      // Add views.
      for (const view of views) {
        layout = layout.addView(view.id, {
          partId: view.options.partId,
          position: view.options.position,
          activateView: view.options.activateView,
          activatePart: view.options.activatePart,
          cssClass: view.options.cssClass,
        });
      }

      // Add navigations.
      for (const viewNavigation of viewNavigations) {
        layout = layout.navigateView(viewNavigation.id, viewNavigation.commands, {
          hint: viewNavigation.extras?.hint,
          state: viewNavigation.extras?.state,
          cssClass: viewNavigation.extras?.cssClass,
        });
      }
      return layout;
    };
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
      this.form.setControl('data', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
  }
}
