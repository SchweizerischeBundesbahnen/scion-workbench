/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { WorkbenchNotificationService } from '@scion/workbench-client';
import { SciParamsEnterComponent } from '@scion/toolkit.internal/widgets';

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
})
export class NotificationOpenerPageComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly SEVERITY = SEVERITY;
  public readonly DURATION = DURATION;
  public readonly GROUP = GROUP;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: FormGroup;

  public error: string;

  constructor(formBuilder: FormBuilder, private _notificationService: WorkbenchNotificationService) {
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
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as FormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as FormArray);

    this.error = null;
    this._notificationService.show({
      title: this.form.get(TITLE).value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      content: this.form.get(CONTENT).value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      params,
      severity: this.form.get(SEVERITY).value || undefined,
      duration: this.form.get(DURATION).value || undefined,
      group: this.form.get(GROUP).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || undefined,
    }, qualifier)
      .catch(error => this.error = error);
  }
}
