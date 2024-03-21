/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchLayoutFn, WorkbenchService} from '@scion/workbench';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {NgIf} from '@angular/common';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {PerspectivePagePartEntry, PerspectivePagePartsComponent} from './perspective-page-parts/perspective-page-parts.component';
import {PerspectivePageViewEntry, PerspectivePageViewsComponent} from './perspective-page-views/perspective-page-views.component';
import {PerspectivePageNavigateViewEntry, PerspectivePageNavigateViewsComponent} from './perspective-page-navigate-views/perspective-page-navigate-views.component';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-perspective-page',
  templateUrl: './perspective-page.component.html',
  styleUrls: ['./perspective-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
    PerspectivePagePartsComponent,
    PerspectivePageViewsComponent,
    PerspectivePageNavigateViewsComponent,
  ],
})
export default class PerspectivePageComponent {

  public form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
    transient: this._formBuilder.control<boolean | undefined>(undefined),
    data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    parts: this._formBuilder.control<PerspectivePagePartEntry[]>([], Validators.required),
    views: this._formBuilder.control<PerspectivePageViewEntry[]>([]),
    navigateViews: this._formBuilder.control<PerspectivePageNavigateViewEntry[]>([]),
  });
  public registerError: string | false | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              private _workbenchService: WorkbenchService) {
  }

  public async onRegister(): Promise<void> {
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
    const navigateViews = this.form.controls.navigateViews.value;

    return (factory: WorkbenchLayoutFactory): WorkbenchLayout => {
      let layout = factory.addPart(initialPart.id, {activate: initialPart.activate});
      for (const part of parts) {
        layout = layout.addPart(part.id, {relativeTo: part.relativeTo, align: part.align!, ratio: part.ratio}, {activate: part.activate});
      }

      for (const view of views) {
        layout = layout.addView(view.id, {
          partId: view.options.partId,
          position: view.options.position,
          activateView: view.options.activateView,
          activatePart: view.options.activatePart,
          cssClass: view.options.cssClass,
        });
      }

      for (const navigateView of navigateViews) {
        layout = layout.navigateView(navigateView.id, navigateView.commands, {
          outlet: navigateView.options?.outlet,
          cssClass: navigateView.options?.cssClass,
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
