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
import { Notification } from '@scion/workbench';

@Component({
  selector: 'app-inspect-notification',
  templateUrl: './inspect-notification.component.html',
  styleUrls: ['./inspect-notification.component.scss'],
})
export class InspectNotificationComponent {

  constructor(public notification: Notification) {
  }
}
