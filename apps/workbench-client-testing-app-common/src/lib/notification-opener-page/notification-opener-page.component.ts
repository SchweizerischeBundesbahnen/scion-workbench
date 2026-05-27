/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, signal, Signal} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Translatable, WORKBENCH_ELEMENT, WorkbenchElement, WorkbenchNotificationOptions, WorkbenchNotificationService} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';
import {toSignal} from '@angular/core/rxjs-interop';
import {MultiValueInputComponent, parseTypedString, stringifyError} from 'workbench-testing-app-common';
import {prune} from '@scion/toolkit/util';
import {Beans} from '@scion/toolkit/bean-manager';

@Component({
  selector: 'app-notification-opener-page',
  templateUrl: './notification-opener-page.component.html',
  styleUrls: ['./notification-opener-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    MultiValueInputComponent,
  ],
})
export class NotificationOpenerPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _notificationService = inject(WorkbenchNotificationService);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([
      this._formBuilder.group({
        key: this._formBuilder.control('component'),
        value: this._formBuilder.control('notification'),
      }),
      this._formBuilder.group({
        key: this._formBuilder.control('app'),
        value: this._formBuilder.control('app1'),
      }),
    ]),
    text: this._formBuilder.control(''),
    options: this._formBuilder.group({
      params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      title: this._formBuilder.control(''),
      severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
      duration: this._formBuilder.control<'short' | 'medium' | 'long' | 'infinite' | number | ''>(''),
      group: this._formBuilder.control(''),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
    count: this._formBuilder.control(1),
  });

  protected readonly durationList = `duration-list-${UUID.randomUUID()}`;

  protected readonly isEmptyQualifier: Signal<boolean>;
  protected readonly notificationOpenError = signal<string | undefined>(undefined);

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();
    this.isEmptyQualifier = this.computeIfEmptyQualifier();
  }

  protected onNotificationShow(): void {
    const count = this.form.controls.count.value || 1;
    for (let i = 0; i < count; i++) {
      void this.showNotification({index: i}); // do not block to simulate opening notifications in quick succession
    }
  }

  private async showNotification(options?: {index?: number}): Promise<void> {
    this.notificationOpenError.set(undefined);

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier) ?? undefined;
    try {
      if (qualifier) {
        await this._notificationService.show(qualifier, this.readOptions(options));
      }
      else {
        const message = parseTypedString<Translatable>(restoreLineBreaks(this.form.controls.text.value)) ?? null;
        await this._notificationService.show(message, this.readOptions(options));
      }
    }
    catch (error) {
      this.notificationOpenError.set(stringifyError(error) || 'Workbench Notification could not be opened');
    }
  }

  /**
   * Reads options from the UI.
   */
  private readOptions(options?: {index?: number}): WorkbenchNotificationOptions {
    const formOptions = this.form.controls.options.controls;
    const cssClass = Array.isArray(formOptions.cssClass.value) ? formOptions.cssClass.value : [formOptions.cssClass.value ?? ''];
    return prune({
      title: restoreLineBreaks(formOptions.title.value) || undefined,
      params: SciKeyValueFieldComponent.toDictionary(formOptions.params) ?? undefined,
      severity: formOptions.severity.value || undefined,
      duration: this.readDurationFromUI(),
      group: formOptions.group.value || undefined,
      cssClass: cssClass.concat(options?.index !== undefined ? `notification-${options.index}` : ''),
    });
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
