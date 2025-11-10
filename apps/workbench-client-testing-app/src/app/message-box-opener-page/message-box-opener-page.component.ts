/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {DialogId, PartId, PopupId, Translatable, ViewId, WorkbenchMessageBoxOptions, WorkbenchMessageBoxService} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {stringifyError} from '../common/stringify-error.util';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import {parseTypedString} from '../common/parse-typed-value.util';
import {UUID} from '@scion/toolkit/uuid';
import {MicrofrontendPlatformClient} from '@scion/microfrontend-platform';

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
export default class MessageBoxOpenerPageComponent {

  private readonly _messageBoxService = inject(WorkbenchMessageBoxService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    message: this._formBuilder.control(''),
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

  protected isEmptyQualifier = true;
  protected openError: string | undefined;
  protected closeAction: string | undefined;

  protected readonly nullList = `autocomplete-null-${UUID.randomUUID()}`;

  constructor() {
    MicrofrontendPlatformClient.signalReady();
    this.installEmptyQualifierDetector();
  }

  protected onMessageBoxOpen(): void {
    this.openError = undefined;
    this.closeAction = undefined;

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier);
    if (qualifier) {
      this._messageBoxService.open(qualifier, this.readOptions())
        .then(closeAction => this.closeAction = closeAction)
        .catch((error: unknown) => this.openError = stringifyError(error));
    }
    else {
      const message = parseTypedString<Translatable>(this.restoreLineBreaks(this.form.controls.message.value)) ?? null;
      this._messageBoxService.open(message, this.readOptions())
        .then(closeAction => this.closeAction = closeAction)
        .catch((error: unknown) => this.openError = stringifyError(error));
    }
  }

  /**
   * Reads options from the UI.
   */
  private readOptions(): WorkbenchMessageBoxOptions {
    const options = this.form.controls.options.controls;
    return {
      title: options.title.value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      params: SciKeyValueFieldComponent.toDictionary(options.params) ?? undefined,
      actions: SciKeyValueFieldComponent.toDictionary(options.actions) ?? undefined,
      severity: options.severity.value || undefined,
      modality: options.modality.value || undefined,
      context: parseTypedString(options.context.value, {undefinedIfEmpty: true}),
      contentSelectable: options.contentSelectable.value || undefined,
      cssClass: options.cssClass.value,
    };
  }

  /**
   * Detects if the qualifier is empty.
   */
  private installEmptyQualifierDetector(): void {
    this.form.controls.qualifier.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(qualifier => {
        this.isEmptyQualifier = !qualifier.length;
      });
  }

  /**
   * Restores line breaks as sanitized by the user agent.
   */
  private restoreLineBreaks(value: string): string {
    return value.replace(/\\n/g, '\n');
  }
}
