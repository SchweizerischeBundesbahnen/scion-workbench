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
import {DockedPartDescriptor, AddDockedPartsComponent} from '../tables/add-docked-parts/add-docked-parts.component';
import {MultiValueInputComponent} from '../../multi-value-input/multi-value-input.component';

@Component({
  selector: 'app-create-perspective-page',
  templateUrl: './create-perspective-page.component.html',
  styleUrls: ['./create-perspective-page.component.scss'],
  imports: [
    AddPartsComponent,
    AddViewsComponent,
    NavigateViewsComponent,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
    NavigatePartsComponent,
    AddDockedPartsComponent,
    MultiValueInputComponent,
  ],
})
export default class CreatePerspectivePageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _settingsService = inject(SettingsService);
  private readonly _workbenchService = inject(WorkbenchService);

  protected readonly form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
    transient: this._formBuilder.control<boolean | undefined>(undefined),
    data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    parts: this._formBuilder.control<PartDescriptor[]>([], Validators.required),
    dockedParts: this._formBuilder.control<DockedPartDescriptor[]>([]),
    views: this._formBuilder.control<ViewDescriptor[]>([]),
    partNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
    viewNavigations: this._formBuilder.control<NavigationDescriptor[]>([]),
    activeParts: this._formBuilder.control<string[] | undefined>([]),
    activeViews: this._formBuilder.control<string[] | undefined>([]),
  });

  protected readonly partProposals = this.computePartProposals();
  protected readonly viewProposals = this.computeViewProposals();

  protected registerError: string | false | undefined;

  private computePartProposals(): Signal<string[]> {
    const parts = toSignal(this.form.controls.parts.valueChanges, {initialValue: []});
    const dockedParts = toSignal(this.form.controls.dockedParts.valueChanges, {initialValue: []});
    const workbenchService = inject(WorkbenchService);

    return computed(() => new Array<WorkbenchPart | DockedPartDescriptor | PartDescriptor>()
      .concat(workbenchService.parts())
      .concat(dockedParts())
      .concat(parts())
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
    const [initialPart, ...parts] = this.form.controls.parts.value as [PartDescriptor, ...PartDescriptor[]];
    const dockedParts = this.form.controls.dockedParts.value;
    const views = this.form.controls.views.value;
    const partNavigations = this.form.controls.partNavigations.value;
    const viewNavigations = this.form.controls.viewNavigations.value;
    const activeParts = this.form.controls.activeParts.value;
    const activeViews = this.form.controls.activeViews.value;

    return (factory: WorkbenchLayoutFactory): WorkbenchLayout => {
      // Add initial part.
      let layout = factory.addPart(initialPart.id, {
        title: initialPart.extras?.title,
        cssClass: initialPart.extras?.cssClass,
        activate: initialPart.extras?.activate,
      });

      // Add docked parts.
      for (const dockedPart of dockedParts) {
        layout = layout.addPart(dockedPart.id, dockedPart.dockTo, {
          icon: dockedPart.extras.icon,
          label: dockedPart.extras.label,
          tooltip: dockedPart.extras.tooltip,
          title: dockedPart.extras.title,
          cssClass: dockedPart.extras.cssClass,
          ɵactivityId: dockedPart.extras.ɵactivityId,
        });
      }

      // Add other parts.
      for (const part of parts) {
        layout = layout.addPart(part.id, {
          relativeTo: part.relativeTo.relativeTo,
          align: part.relativeTo.align!,
          ratio: part.relativeTo.ratio,
        }, {
          title: part.extras?.title,
          cssClass: part.extras?.cssClass,
          activate: part.extras?.activate,
        });
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

      // Activate parts.
      for (const part of activeParts ?? []) {
        layout = layout.activatePart(part);
      }

      // Activate views.
      for (const view of activeViews ?? []) {
        layout = layout.activateView(view);
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
