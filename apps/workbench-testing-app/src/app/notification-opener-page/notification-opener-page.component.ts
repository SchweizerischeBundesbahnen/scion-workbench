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
import {NotificationService, Translatable, WorkbenchNotificationOptions, WorkbenchNotificationService} from '@scion/workbench';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {MultiValueInputComponent, parseTypedString, prune, stringifyError} from 'workbench-testing-app-common';
import NotificationPageComponent from '../notification-page/notification-page.component';
import {UUID} from '@scion/toolkit/uuid';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {LegacyNotificationPageComponent} from '../legacy-notification-page/legacy-notification-page.component';
import FocusTestPageComponent from '../test-pages/focus-test-page/focus-test-page.component';
import {firstValueFrom, timer} from 'rxjs';

@Component({
  selector: 'app-notification-opener-page',
  templateUrl: './notification-opener-page.component.html',
  styleUrl: './notification-opener-page.component.scss',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    MultiValueInputComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class NotificationOpenerPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _notificationService = inject(WorkbenchNotificationService);
  private readonly _legacyNotificationService = inject(NotificationService);

  protected readonly durationList = `duration-list-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
    component: this._formBuilder.control(''),
    text: this._formBuilder.control(''),
    options: this._formBuilder.group({
      title: this._formBuilder.control(''),
      severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
      duration: this._formBuilder.control<'short' | 'medium' | 'long' | 'infinite' | '' | number>(''),
      group: this._formBuilder.control(''),
      groupInputReduceFn: this._formBuilder.control(''),
      inputs: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      inputLegacy: this._formBuilder.control(''),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
    count: this._formBuilder.control(1),
    // TODO [Angular 22] Remove backward compatiblity.
    legacyAPI: this._formBuilder.control(false),
  });

  protected notificationOpenError: string | undefined;

  protected onNotificationShow(): void {
    const count = this.form.controls.count.value || 1;
    for (let i = 0; i < count; i++) {
      this.showNotification();
    }
  }

  private showNotification(): void {
    this.notificationOpenError = undefined;
    try {
      if (this.form.controls.legacyAPI.value) {
        const options = this.form.controls.options.controls;
        this._legacyNotificationService.notify(prune({
          content: this.isUseComponent() ? this.readComponentFromUI() : restoreLineBreaks(this.form.controls.text.value),
          componentInput: (this.isUseComponent() ? options.inputLegacy.value || undefined : undefined),
          title: restoreLineBreaks(options.title.value) || undefined,
          severity: options.severity.value || undefined,
          duration: this.readDurationFromUI(),
          group: options.group.value || undefined,
          groupInputReduceFn: this.readGroupInputReducerFromUI(this.form.controls.options.controls.groupInputReduceFn.value || undefined),
          cssClass: options.cssClass.value,
        }));
      }
      else {
        const options: WorkbenchNotificationOptions = prune({
          inputs: SciKeyValueFieldComponent.toDictionary(this.form.controls.options.controls.inputs) ?? undefined,
          title: restoreLineBreaks(this.form.controls.options.controls.title.value) || undefined,
          severity: this.form.controls.options.controls.severity.value || undefined,
          duration: this.readDurationFromUI(),
          group: this.form.controls.options.controls.group.value || undefined,
          groupInputReduceFn: this.readGroupInputReducerFromUI(this.form.controls.options.controls.groupInputReduceFn.value || undefined),
          cssClass: this.form.controls.options.controls.cssClass.value ?? undefined,
        });

        if (this.isUseComponent()) {
          this._notificationService.show(this.readComponentFromUI(), options);
        }
        else {
          const text = parseTypedString<Translatable>(restoreLineBreaks(this.form.controls.text.value)) ?? null;
          this._notificationService.show(text, options);
        }
      }
    }
    catch (error) {
      this.notificationOpenError = stringifyError(error) || 'Workbench Notification could not be opened';
    }
  }

  private readComponentFromUI(): Type<unknown> {
    switch (this.form.controls.component.value) {
      case 'notification-page':
        return NotificationPageComponent;
      case 'focus-test-page':
        return FocusTestPageComponent;
      case 'legacy-notification-page':
        return LegacyNotificationPageComponent;
      default:
        throw Error(`[IllegalNotificationComponent] Notification component not supported: ${this.form.controls.component.value}`);
    }
  }

  private readDurationFromUI(): 'short' | 'medium' | 'long' | 'infinite' | number | undefined {
    const duration = this.form.controls.options.controls.duration.value;
    if (duration === '') {
      return undefined;
    }
    if (isNaN(Number(duration))) {
      return duration;
    }
    return Number(duration);
  }

  private readGroupInputReducerFromUI(groupInputReduceFn: string | undefined): GroupInputReducerFn | undefined {
    switch (groupInputReduceFn) {
      case undefined:
        return undefined;
      case 'concat-input-reducer':
        return concatInputReduceFn;
      case 'concat-input-legacy-reducer':
        return concatInputLegacyReduceFn as unknown as GroupInputReducerFn;
      case 'concat-input-async-reducer':
        return concatInputAsyncReduceFn;
      default:
        throw Error(`[IllegalGroupInputReduceFn] Reducer function not supported: ${groupInputReduceFn}`);
    }
  }

  protected isUseComponent(): boolean {
    return !!this.form.controls.component.value;
  }
}

/**
 * Concatenates the inputs of the previous and current notification.
 */
function concatInputReduceFn(prevInput: {[name: string]: unknown}, currInput: {[name: string]: unknown}): {[name: string]: unknown} {
  return Object.entries(currInput).reduce((inputs, [key, value]) => ({
    ...inputs,
    [key]: `${prevInput[key] as string}, ${value as string}`,
  }), {});
}

/**
 * Concatenates the inputs of the previous and current notification asynchronously.
 */
async function concatInputAsyncReduceFn(prevInput: {[name: string]: unknown}, currInput: {[name: string]: unknown}): Promise<{[name: string]: unknown}> {
  await firstValueFrom(timer(500));
  return Object.entries(currInput).reduce((inputs, [key, value]) => ({
    ...inputs,
    [key]: `${prevInput[key] as string}, ${value as string}`,
  }), {});
}

/**
 * Concatenates the inputs of the previous and current notification (legacy Notification API).
 */
function concatInputLegacyReduceFn(prevInput: string, currInput: string): string {
  return `${prevInput}, ${currInput}`;
}

/**
 * Restores line breaks as sanitized by the user agent.
 */
function restoreLineBreaks(value: string): string {
  return value.replace(/\\n/g, '\n');
}

type GroupInputReducerFn = (prevInput: {[name: string]: unknown}, currInput: {[name: string]: unknown}) => {[name: string]: unknown} | Promise<{[name: string]: unknown}>;
