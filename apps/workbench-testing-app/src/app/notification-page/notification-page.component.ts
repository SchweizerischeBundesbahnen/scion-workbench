/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {Notification} from '@scion/workbench';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciViewportComponent} from '@scion/components/viewport';
import {StringifyPipe} from '../common/stringify.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    StringifyPipe,
    SciFormFieldComponent,
    SciViewportComponent,
    MultiValueInputComponent,
  ],
})
export class NotificationPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly notification = inject(Notification) as Notification<Map<string, unknown>>;
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
        this.notification.setTitle(title || undefined);
      });

    this.form.controls.severity.valueChanges
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(),
      )
      .subscribe(severity => {
        this.notification.setSeverity(severity);
      });

    this.form.controls.duration.valueChanges
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(),
      )
      .subscribe(duration => {
        this.notification.setDuration(this.parseDurationFromUI(duration));
      });

    this.form.controls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClass => {
        this.notification.setCssClass(cssClass ?? []);
      });
  }

  private parseDurationFromUI(duration: 'short' | 'medium' | 'long' | 'infinite' | string): 'short' | 'medium' | 'long' | 'infinite' | number {
    if (isNaN(Number(duration))) {
      return duration as 'short' | 'medium' | 'long' | 'infinite';
    }
    return Number(duration);
  }
}
