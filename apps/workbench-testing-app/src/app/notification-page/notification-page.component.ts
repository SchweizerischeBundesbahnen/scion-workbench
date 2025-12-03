/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, input} from '@angular/core';
import {WorkbenchNotification} from '@scion/workbench';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {MultiValueInputComponent} from 'workbench-testing-app-common';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    MultiValueInputComponent,
  ],
})
export class NotificationPageComponent {

  public readonly input = input<string>();

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly notification = inject(WorkbenchNotification);
  protected readonly durationList = `duration-list-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    severity: this._formBuilder.control<'info' | 'warn' | 'error' | undefined>(undefined),
    duration: this._formBuilder.control<'short' | 'medium' | 'long' | 'infinite' | string | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  constructor() {
    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(title => {
        this.notification.title = title || undefined;
      });

    this.form.controls.severity.valueChanges
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(),
      )
      .subscribe(severity => {
        this.notification.severity = severity;
      });

    this.form.controls.duration.valueChanges
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(),
      )
      .subscribe(duration => {
        this.notification.duration = this.readDurationFromUI(duration);
      });

    this.form.controls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClass => {
        this.notification.cssClass = cssClass || [];
      });
  }

  protected onClose(): void {
    this.notification.close();
  }

  private readDurationFromUI(duration: 'short' | 'medium' | 'long' | 'infinite' | string): 'short' | 'medium' | 'long' | 'infinite' | number {
    if (isNaN(Number(duration))) {
      return duration as 'short' | 'medium' | 'long' | 'infinite';
    }
    return Number(duration);
  }
}
