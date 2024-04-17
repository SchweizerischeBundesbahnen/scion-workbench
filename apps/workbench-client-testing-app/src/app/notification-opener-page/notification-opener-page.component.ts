/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {WorkbenchNotificationService, WorkbenchView} from '@scion/workbench-client';
import {NgIf} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {CssClassComponent} from '../css-class/css-class.component';

@Component({
  selector: 'app-notification-opener-page',
  templateUrl: './notification-opener-page.component.html',
  styleUrls: ['./notification-opener-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    CssClassComponent,
  ],
})
export default class NotificationOpenerPageComponent {

  public form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    title: this._formBuilder.control(''),
    content: this._formBuilder.control(''),
    severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
    duration: this._formBuilder.control<'short' | 'medium' | 'long' | 'infinite' | number | ''>(''),
    group: this._formBuilder.control(''),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  public notificationOpenError: string | undefined;

  constructor(view: WorkbenchView,
              private _formBuilder: NonNullableFormBuilder,
              private _notificationService: WorkbenchNotificationService) {
    view.signalReady();
  }

  public onNotificationShow(): void {
    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier);
    const params = SciKeyValueFieldComponent.toDictionary(this.form.controls.params);

    this.notificationOpenError = undefined;
    this._notificationService.show({
      title: this.form.controls.title.value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      content: this.form.controls.content.value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      params: params ?? undefined,
      severity: this.form.controls.severity.value || undefined,
      duration: this.parseDurationFromUI(),
      group: this.form.controls.group.value || undefined,
      cssClass: this.form.controls.cssClass.value,
    }, qualifier ?? undefined)
      .catch(error => this.notificationOpenError = stringifyError(error) || 'Workbench Notification could not be opened');
  }

  private parseDurationFromUI(): 'short' | 'medium' | 'long' | 'infinite' | number | undefined {
    const duration = this.form.controls.duration.value;
    if (duration === '') {
      return undefined;
    }
    if (isNaN(Number(duration))) {
      return duration;
    }
    return Number(duration);
  }
}
