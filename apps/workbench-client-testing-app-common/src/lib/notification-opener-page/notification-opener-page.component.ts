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
import {Translatable, WORKBENCH_ELEMENT, WorkbenchElement, WorkbenchNotificationConfig, WorkbenchNotificationOptions, WorkbenchNotificationService} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {toSignal} from '@angular/core/rxjs-interop';
import {MultiValueInputComponent, parseTypedString, prune, stringifyError} from 'workbench-testing-app-common';
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
    SciCheckboxComponent,
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
    // TODO [Angular 22] Remove backward compatiblity.
    legacyAPI: this._formBuilder.group({
      enabled: this._formBuilder.control(false),
      textAsConfig: this._formBuilder.control(false),
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
      void this.showNotification(); // do not block to simulate opening notifications in quick succession
    }
  }

  private async showNotification(): Promise<void> {
    this.notificationOpenError.set(undefined);

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier) ?? undefined;
    try {
      if (this.form.controls.legacyAPI.controls.enabled.value) {
        if (this.form.controls.legacyAPI.controls.textAsConfig.value) {
          await this._notificationService.show(this.readConfig(), qualifier);
        }
        else {
          await this._notificationService.show(restoreLineBreaks(this.form.controls.text.value) || '', qualifier);
        }
      }
      else {
        if (qualifier) {
          await this._notificationService.show(qualifier, this.readOptions());
        }
        else {
          const message = parseTypedString<Translatable>(restoreLineBreaks(this.form.controls.text.value)) ?? null;
          await this._notificationService.show(message, this.readOptions());
        }
      }
    }
    catch (error) {
      this.notificationOpenError.set(stringifyError(error) || 'Workbench Notification could not be opened');
    }
  }

  /**
   * Reads options from the UI.
   */
  private readOptions(): WorkbenchNotificationOptions {
    const options = this.form.controls.options.controls;
    return prune({
      title: restoreLineBreaks(options.title.value) || undefined,
      params: SciKeyValueFieldComponent.toDictionary(options.params) ?? undefined,
      severity: options.severity.value || undefined,
      duration: this.readDurationFromUI(),
      group: options.group.value || undefined,
      cssClass: options.cssClass.value ?? undefined,
    });
  }

  /**
   * Reads config from the UI.
   */
  private readConfig(): WorkbenchNotificationConfig {
    const options = this.form.controls.options.controls;
    return prune({
      title: restoreLineBreaks(options.title.value) || undefined,
      content: restoreLineBreaks(this.form.controls.text.value) || undefined,
      params: SciKeyValueFieldComponent.toDictionary(options.params) ?? undefined,
      severity: options.severity.value || undefined,
      duration: this.readDurationFromUI(),
      group: options.group.value || undefined,
      cssClass: options.cssClass.value ?? undefined,
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
