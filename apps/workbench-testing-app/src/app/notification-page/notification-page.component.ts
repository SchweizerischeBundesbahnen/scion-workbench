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
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService, WorkbenchView } from '@scion/workbench';
import { ActivatedRoute } from '@angular/router';

const TITLE = 'title';
const CONTENT = 'content';
const SEVERITY = 'severity';
const DURATION = 'duration';
const GROUP = 'group';
const CSS_CLASS = 'cssClass';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss'],
})
export class NotificationPageComponent {

  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly SEVERITY = SEVERITY;
  public readonly DURATION = DURATION;
  public readonly GROUP = GROUP;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder,
              route: ActivatedRoute,
              view: WorkbenchView,
              private _notificationService: NotificationService) {
    view.title = route.snapshot.data['title'];
    view.heading = route.snapshot.data['heading'];
    view.cssClass = route.snapshot.data['cssClass'];

    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [CONTENT]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [DURATION]: formBuilder.control(''),
      [GROUP]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
    });
  }

  public onOpen(): void {
    this._notificationService.notify({
      title: this.form.get(TITLE).value || undefined,
      content: this.form.get(CONTENT).value || undefined,
      severity: this.form.get(SEVERITY).value || undefined,
      duration: this.form.get(DURATION).value || undefined,
      group: this.form.get(GROUP).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || undefined,
    });
  }
}
