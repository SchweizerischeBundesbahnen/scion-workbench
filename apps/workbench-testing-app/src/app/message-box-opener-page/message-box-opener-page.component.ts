/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Type} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {DialogId, PartId, PopupId, Translatable, ViewId, WorkbenchMessageBoxOptions, WorkbenchMessageBoxService} from '@scion/workbench';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {MessageBoxPageComponent} from '../message-box-page/message-box-page.component';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import FocusTestPageComponent from '../test-pages/focus-test-page/focus-test-page.component';
import {UUID} from '@scion/toolkit/uuid';
import {parseTypedString} from '../common/parse-typed-value.util';

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

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _messageBoxService = inject(WorkbenchMessageBoxService);
  protected readonly nullList = `autocomplete-null-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
    component: this._formBuilder.control(''),
    message: this._formBuilder.control(''),
    options: this._formBuilder.group({
      title: this._formBuilder.control(''),
      actions: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
      modality: this._formBuilder.control<'' | 'none' | 'context' | 'application' | 'view'>(''),
      context: this._formBuilder.control<ViewId | PartId | DialogId | PopupId | '<null>' | ''>(''),
      contentSelectable: this._formBuilder.control(false),
      inputs: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
  });

  protected messageBoxError: string | undefined;
  protected closeAction: string | undefined;

  protected async onMessageBoxOpen(): Promise<void> {
    this.messageBoxError = undefined;
    this.closeAction = undefined;

    await this.openMessageBox()
      .then(closeAction => this.closeAction = closeAction)
      .catch((error: unknown) => this.messageBoxError = stringifyError(error));
  }

  private openMessageBox(): Promise<string> {
    const options: WorkbenchMessageBoxOptions = {
      title: this.restoreLineBreaks(this.form.controls.options.controls.title.value) || undefined,
      actions: SciKeyValueFieldComponent.toDictionary(this.form.controls.options.controls.actions) ?? undefined,
      severity: this.form.controls.options.controls.severity.value || undefined,
      modality: this.form.controls.options.controls.modality.value || undefined,
      context: parseTypedString(this.form.controls.options.controls.context.value, {undefinedIfEmpty: true}),
      contentSelectable: this.form.controls.options.controls.contentSelectable.value || undefined,
      inputs: SciKeyValueFieldComponent.toDictionary(this.form.controls.options.controls.inputs) ?? undefined,
      cssClass: this.form.controls.options.controls.cssClass.value,
    };

    if (this.isUseComponent()) {
      return this._messageBoxService.open(this.readComponentFromUI(), options);
    }
    else {
      const message = parseTypedString<Translatable>(this.restoreLineBreaks(this.form.controls.message.value)) ?? null;
      return this._messageBoxService.open(message, options);
    }
  }

  private readComponentFromUI(): Type<unknown> {
    switch (this.form.controls.component.value) {
      case 'message-box-page':
        return MessageBoxPageComponent;
      case 'focus-test-page':
        return FocusTestPageComponent;
      default:
        throw Error(`[IllegalMessageBoxComponent] Message box component not supported: ${this.form.controls.component.value}`);
    }
  }

  protected isUseComponent(): boolean {
    return !!this.form.controls.component.value;
  }

  /**
   * Restores line breaks as sanitized by the user agent.
   */
  private restoreLineBreaks(value: string): string {
    return value.replace(/\\n/g, '\n');
  }
}
