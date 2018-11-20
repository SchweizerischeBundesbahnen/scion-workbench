/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SciParamsEnterComponent } from '@scion/app/common';
import { Qualifier } from '@scion/workbench-application-platform.api';
import { Notification, NotificationService } from '@scion/workbench-application.core';
import { CustomValidators } from '../custom-validators';

const QUALIFIER = 'qualifier';
const TITLE = 'title';
const TEXT = 'text';
const SEVERITY = 'severity';
const DURATION = 'duration';
const GROUP = 'group';
const CSS_CLASS = 'css-class';
const PAYLOAD = 'payload';

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
})
export class NotificationPanelComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly TITLE = TITLE;
  public readonly TEXT = TEXT;
  public readonly SEVERITY = SEVERITY;
  public readonly DURATION = DURATION;
  public readonly GROUP = GROUP;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly PAYLOAD = PAYLOAD;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _notificationService: NotificationService) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([]),
      [TITLE]: formBuilder.control(null),
      [TEXT]: formBuilder.control(null),
      [SEVERITY]: formBuilder.control('info'),
      [DURATION]: formBuilder.control('medium'),
      [GROUP]: formBuilder.control(null),
      [CSS_CLASS]: formBuilder.control([]),
      [PAYLOAD]: formBuilder.control(undefined, CustomValidators.json),
    });
  }

  public onShow(): void {
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray);
    const notification: Notification = {
      title: this.form.get(TITLE).value,
      text: this.form.get(TEXT).value,
      severity: this.form.get(SEVERITY).value,
      duration: this.form.get(DURATION).value,
      group: this.form.get(GROUP).value,
      cssClass: this.form.get(CSS_CLASS).value,
      payload: JSON.parse(this.form.get(PAYLOAD).value || null),
    };

    this._notificationService.notify(notification, Object.keys(qualifier).length && qualifier);
  }
}
