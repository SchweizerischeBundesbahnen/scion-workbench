/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, signal, Signal} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {DialogId, PartId, PopupId, Translatable, ViewId, WORKBENCH_ELEMENT, WorkbenchElement, WorkbenchMessageBoxOptions, WorkbenchMessageBoxService} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {toSignal} from '@angular/core/rxjs-interop';
import {UUID} from '@scion/toolkit/uuid';
import {MultiValueInputComponent, parseTypedString, prune, stringifyError} from 'workbench-testing-app-common';
import {Beans} from '@scion/toolkit/bean-manager';

@Component({
  selector: 'app-message-box-opener-page',
  templateUrl: './message-box-opener-page.component.html',
  styleUrls: ['./message-box-opener-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    MultiValueInputComponent,
  ],
})
export class MessageBoxOpenerPageComponent {

  private readonly _messageBoxService = inject(WorkbenchMessageBoxService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    text: this._formBuilder.control(''),
    options: this._formBuilder.group({
      params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      title: this._formBuilder.control(''),
      actions: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
      modality: this._formBuilder.control<'' | 'none' | 'context' | 'application' | 'view'>(''),
      context: this._formBuilder.control<ViewId | PartId | DialogId | PopupId | '<null>' | ''>(''),
      contentSelectable: this._formBuilder.control(true),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
  });

  protected readonly isEmptyQualifier: Signal<boolean>;
  protected readonly openError = signal<string | undefined>(undefined);
  protected readonly closeAction = signal<string | undefined>(undefined);

  protected readonly nullList = `autocomplete-null-${UUID.randomUUID()}`;

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();
    this.isEmptyQualifier = this.computeIfEmptyQualifier();
  }

  protected onMessageBoxOpen(): void {
    this.openError.set(undefined);
    this.closeAction.set(undefined);

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier);
    if (qualifier) {
      this._messageBoxService.open(qualifier, this.readOptions())
        .then(closeAction => this.closeAction.set(closeAction))
        .catch((error: unknown) => this.openError.set(stringifyError(error)));
    }
    else {
      const message = parseTypedString<Translatable>(restoreLineBreaks(this.form.controls.text.value)) ?? null;
      this._messageBoxService.open(message, this.readOptions())
        .then(closeAction => this.closeAction.set(closeAction))
        .catch((error: unknown) => this.openError.set(stringifyError(error)));
    }
  }

  /**
   * Reads options from the UI.
   */
  private readOptions(): WorkbenchMessageBoxOptions {
    const options = this.form.controls.options.controls;
    return prune({
      title: restoreLineBreaks(options.title.value) || undefined,
      params: SciKeyValueFieldComponent.toDictionary(options.params) ?? undefined,
      actions: SciKeyValueFieldComponent.toDictionary(options.actions) ?? undefined,
      severity: options.severity.value || undefined,
      modality: options.modality.value || undefined,
      context: parseTypedString(options.context.value, {undefinedIfEmpty: true}),
      contentSelectable: options.contentSelectable.value || undefined,
      cssClass: options.cssClass.value,
    });
  }

  /**
   * Computes whether the qualifier is empty.
   */
  private computeIfEmptyQualifier(): Signal<boolean> {
    const qualifier = toSignal(this.form.controls.qualifier.valueChanges, {initialValue: this.form.controls.qualifier.value});
    return computed(() => !qualifier().length);
  }
}

/**
 * Restores line breaks as sanitized by the user agent.
 */
function restoreLineBreaks(value: string): string {
  return value.replace(/\\n/g, '\n');
}
