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
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NotificationService} from '@scion/workbench';
import {NgIf} from '@angular/common';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {stringifyError} from '../common/stringify-error.util';
import {NotificationPageComponent} from '../notification-page/notification-page.component';
import {CssClassComponent} from '../css-class/css-class.component';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-notification-opener-page',
  templateUrl: './notification-opener-page.component.html',
  styleUrls: ['./notification-opener-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    CssClassComponent,
  ],
})
export default class NotificationOpenerPageComponent {

  public notificationOpenError: string | undefined;

  public form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    content: this._formBuilder.control(''),
    component: this._formBuilder.control<'notification-page' | ''>(''),
    componentInput: this._formBuilder.control(''),
    severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
    duration: this._formBuilder.control<'short' | 'medium' | 'long' | 'infinite' | '' | number>(''),
    group: this._formBuilder.control(''),
    useGroupInputReducer: this._formBuilder.control(false),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  public durationList = `duration-list-${UUID.randomUUID()}`;

  constructor(private _formBuilder: NonNullableFormBuilder, private _notificationService: NotificationService) {
  }

  public onNotificationShow(): void {
    this.notificationOpenError = undefined;
    try {
      this._notificationService.notify({
        title: this.restoreLineBreaks(this.form.controls.title.value) || undefined,
        content: this.isUseComponent() ? this.parseComponentFromUI() : this.restoreLineBreaks(this.form.controls.content.value),
        componentInput: (this.isUseComponent() ? this.form.controls.componentInput.value : undefined) || undefined,
        severity: this.form.controls.severity.value || undefined,
        duration: this.parseDurationFromUI(),
        group: this.form.controls.group.value || undefined,
        groupInputReduceFn: this.isUseGroupInputReducer() ? concatInput : undefined,
        cssClass: this.form.controls.cssClass.value,
      });
    }
    catch (error) {
      this.notificationOpenError = stringifyError(error) || 'Workbench Notification could not be opened';
    }
  }

  private parseComponentFromUI(): Type<NotificationPageComponent> {
    switch (this.form.controls.component.value) {
      case 'notification-page':
        return NotificationPageComponent;
      default:
        throw Error(`[IllegalNotificationComponent] Notification component not supported: ${this.form.controls.component.value}`);
    }
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

  public isUseComponent(): boolean {
    return !!this.form.controls.component.value;
  }

  public isUseGroupInputReducer(): boolean {
    return this.form.controls.useGroupInputReducer.value;
  }

  /**
   * Restores line breaks as sanitized by the user agent.
   */
  private restoreLineBreaks(value: string): string {
    return value.replace(/\\n/g, '\n');
  }
}

function concatInput(prevInput: string, currInput: string): string {
  return `${prevInput}, ${currInput}`;
}
