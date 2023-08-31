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
  ],
})
export default class PerspectivePageComponent {

  public form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
    transient: this._formBuilder.control<boolean | undefined>(undefined),
    data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    parts: this._formBuilder.control<PerspectivePagePartEntry[]>([], Validators.required),
    views: this._formBuilder.control<PerspectivePageViewEntry[]>([]),
  });
  public registerError: string | false | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder, private _workbenchService: WorkbenchService) {
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
      this.form.reset();
      this.form.setControl('data', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
    catch (error) {
      this.registerError = stringifyError(error);
    }
  }

  private createLayout(): WorkbenchLayoutFn {
    // Capture form values, since the `layout` function is evaluated independently of the form life-cycle
    const [initialPart, ...parts] = this.form.controls.parts.value;
    const views = this.form.controls.views.value;

    return (factory: WorkbenchLayoutFactory): WorkbenchLayout => {
      let layout = factory.addPart(initialPart.id, {activate: initialPart.activate});
      for (const part of parts) {
        layout = layout.addPart(part.id, {relativeTo: part.relativeTo, align: part.align!, ratio: part.ratio}, {activate: part.activate});
      }

      for (const view of views) {
        layout = layout.addView(view.id, {partId: view.partId, position: view.position, activateView: view.activateView, activatePart: view.activatePart});
      }
      return layout;
    };
  }
}
