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
import {ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {WorkbenchNotificationService} from '@scion/workbench-client';
import {SciParamsEnterComponent, SciParamsEnterModule} from '@scion/components.internal/params-enter';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {NgIf} from '@angular/common';

const QUALIFIER = 'qualifier';
const PARAMS = 'params';
const TITLE = 'title';
const CONTENT = 'content';
const SEVERITY = 'severity';
const DURATION = 'duration';
const GROUP = 'group';
const CSS_CLASS = 'cssClass';

@Component({
  selector: 'app-notification-opener-page',
  templateUrl: './notification-opener-page.component.html',
  styleUrls: ['./notification-opener-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldModule,
    SciParamsEnterModule,
  ],
})
export default class NotificationOpenerPageComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly SEVERITY = SEVERITY;
  public readonly DURATION = DURATION;
  public readonly GROUP = GROUP;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: UntypedFormGroup;

  public error: string;

  constructor(formBuilder: UntypedFormBuilder, private _notificationService: WorkbenchNotificationService) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([]),
      [PARAMS]: formBuilder.array([]),
      [TITLE]: formBuilder.control(''),
      [CONTENT]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [DURATION]: formBuilder.control(''),
      [GROUP]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
    });
  }

  public onNotificationShow(): void {
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as UntypedFormArray);

    this.error = null;
    this._notificationService.show({
      title: this.form.get(TITLE).value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      content: this.form.get(CONTENT).value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      params,
      severity: this.form.get(SEVERITY).value || undefined,
      duration: this.parseDurationFromUI(),
      group: this.form.get(GROUP).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
    }, qualifier)
      .catch(error => this.error = error);
  }

  private parseDurationFromUI(): 'short' | 'medium' | 'long' | 'infinite' | number | undefined {
    const duration = this.form.get(DURATION).value;
    if (duration === '') {
      return undefined;
    }
    if (isNaN(Number(duration))) {
      return duration;
    }
    return Number(duration);
  }
}
