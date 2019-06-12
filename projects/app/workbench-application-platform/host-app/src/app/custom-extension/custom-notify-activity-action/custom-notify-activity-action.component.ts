/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Inject } from '@angular/core';
import { NotificationService } from '@scion/workbench';
import { ACTIVITY_ACTION } from '@scion/workbench-application-platform';
import { CustomNotifyActivityAction } from '@scion/app/common';

@Component({
  selector: 'app-custom-notify-activity-action',
  templateUrl: './custom-notify-activity-action.component.html',
  styleUrls: ['./custom-notify-activity-action.component.scss'],
})
export class CustomNotifyActivityActionComponent {

  constructor(@Inject(ACTIVITY_ACTION) public action: CustomNotifyActivityAction,
              private _notificationService: NotificationService) {
  }

  public onClick(event: Event): void {
    event.preventDefault();
    this._notificationService.notify({
      content: this.action.properties.text,
      cssClass: this.action.properties.cssClass,
    });
  }
}
