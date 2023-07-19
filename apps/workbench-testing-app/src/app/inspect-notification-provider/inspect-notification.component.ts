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
import {Notification} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {SciViewportComponent} from '@scion/components/viewport';
import {StringifyPipe} from '../common/stringify.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-inspect-notification',
  templateUrl: './inspect-notification.component.html',
  styleUrls: ['./inspect-notification.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    StringifyPipe,
    SciFormFieldComponent,
    SciViewportComponent,
  ],
})
export class InspectNotificationComponent {

  public uuid = UUID.randomUUID();
  public form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    severity: this._formBuilder.control<'info' | 'warn' | 'error' | undefined>(undefined),
    duration: this._formBuilder.control<'short' | 'medium' | 'long' | 'infinite' | number | undefined>(undefined),
    cssClass: this._formBuilder.control(''),
  });

  constructor(public notification: Notification<Map<string, any>>, private _formBuilder: NonNullableFormBuilder) {
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
        this.notification.setCssClass(cssClass.split(/\s+/).filter(Boolean));
      });
  }

  private parseDurationFromUI(duration: 'short' | 'medium' | 'long' | 'infinite' | any): 'short' | 'medium' | 'long' | 'infinite' | number {
    if (isNaN(Number(duration))) {
      return duration;
    }
    return Number(duration);
  }
}
