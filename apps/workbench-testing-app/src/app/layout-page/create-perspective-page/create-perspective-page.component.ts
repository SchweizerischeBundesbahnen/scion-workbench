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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SettingsService} from '../../settings.service';
import {WorkbenchLayout, WorkbenchLayoutFactory, WorkbenchLayoutFn, WorkbenchPart, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {stringifyError} from '../../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {NavigatePartsComponent} from '../tables/navigate-parts/navigate-parts.component';
import {toSignal} from '@angular/core/rxjs-interop';

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
    NavigatePartsComponent,
  ],
})
export default class CreatePerspectivePageComponent {

  protected form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
    transient: this._formBuilder.control<boolean | undefined>(undefined),
    data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    parts: this._formBuilder.control<PartDescriptor[]>([], Validators.required),
    views: this._formBuilder.control<ViewDescriptor[]>([]),
    partNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
    viewNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
  });

  protected registerError: string | false | undefined;
  protected partProposals: Signal<string[]>;
  protected viewProposals: Signal<string[]>;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              private _workbenchService: WorkbenchService) {
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

  protected async onRegister(): Promise<void> {
    this.registerError = undefined;
    try {
      await this._workbenchService.registerPerspective({
        id: this.form.controls.id.value,
        transient: this.form.controls.transient.value ? true : undefined,
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
    const partNavigations = this.form.controls.partNavigations.value;
    const viewNavigations = this.form.controls.viewNavigations.value;

    return (factory: WorkbenchLayoutFactory): WorkbenchLayout => {
      // Add initial part.
      let layout = factory.addPart(initialPart.id, {
        activate: initialPart.options?.activate,
      });

      // Add other parts.
      for (const part of parts) {
        layout = layout.addPart(part.id, {
          relativeTo: part.relativeTo.relativeTo,
          align: part.relativeTo.align!,
          ratio: part.relativeTo.ratio,
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

      // Add part navigations.
      for (const partNavigation of partNavigations) {
        layout = layout.navigatePart(partNavigation.id, partNavigation.commands, {
          hint: partNavigation.extras?.hint,
          data: partNavigation.extras?.data,
          state: partNavigation.extras?.state,
          cssClass: partNavigation.extras?.cssClass,
        });
      }

      // Add view navigations.
      for (const viewNavigation of viewNavigations) {
        layout = layout.navigateView(viewNavigation.id, viewNavigation.commands, {
          hint: viewNavigation.extras?.hint,
          data: viewNavigation.extras?.data,
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
