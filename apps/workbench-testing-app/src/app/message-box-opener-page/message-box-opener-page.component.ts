/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Type} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {WorkbenchMessageBoxOptions, WorkbenchMessageBoxService} from '@scion/workbench';
import {NgIf} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {MessageBoxPageComponent} from '../message-box-page/message-box-page.component';
import {CssClassComponent} from '../css-class/css-class.component';

@Component({
  selector: 'app-message-box-opener-page',
  templateUrl: './message-box-opener-page.component.html',
  styleUrls: ['./message-box-opener-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    CssClassComponent,
  ],
})
export default class MessageBoxOpenerPageComponent {

  public form = this._formBuilder.group({
    component: this._formBuilder.control(''),
    message: this._formBuilder.control(''),
    options: this._formBuilder.group({
      title: this._formBuilder.control(''),
      actions: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
      modality: this._formBuilder.control<'application' | 'view' | ''>(''),
      contentSelectable: this._formBuilder.control(false),
      inputs: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
  });

  public messageBoxError: string | undefined;
  public closeAction: string | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _messageBoxService: WorkbenchMessageBoxService) {
  }

  public async onMessageBoxOpen(): Promise<void> {
    this.messageBoxError = undefined;
    this.closeAction = undefined;

    await this.openMessageBox()
      .then(closeAction => this.closeAction = closeAction)
      .catch(error => this.messageBoxError = stringifyError(error));
  }

  private openMessageBox(): Promise<string> {
    const options: WorkbenchMessageBoxOptions = {
      title: this.restoreLineBreaks(this.form.controls.options.controls.title.value) || undefined,
      actions: SciKeyValueFieldComponent.toDictionary(this.form.controls.options.controls.actions) || undefined,
      severity: this.form.controls.options.controls.severity.value || undefined,
      modality: this.form.controls.options.controls.modality.value || undefined,
      contentSelectable: this.form.controls.options.controls.contentSelectable.value || undefined,
      inputs: SciKeyValueFieldComponent.toDictionary(this.form.controls.options.controls.inputs) ?? undefined,
      cssClass: this.form.controls.options.controls.cssClass.value,
    };

    if (this.isUseComponent()) {
      return this._messageBoxService.open(this.parseComponentFromUI(), options);
    }
    else {
      return this._messageBoxService.open(this.restoreLineBreaks(this.form.controls.message.value), options);
    }
  }

  private parseComponentFromUI(): Type<MessageBoxPageComponent> {
    switch (this.form.controls.component.value) {
      case 'message-box-page':
        return MessageBoxPageComponent;
      default:
        throw Error(`[IllegalMessageBoxComponent] Message box component not supported: ${this.form.controls.component.value}`);
    }
  }

  public isUseComponent(): boolean {
    return !!this.form.controls.component.value;
  }

  /**
   * Restores line breaks as sanitized by the user agent.
   */
  private restoreLineBreaks(value: string): string {
    return value.replace(/\\n/g, '\n');
  }
}
