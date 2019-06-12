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
import { ACTIVITY_ACTION } from '../metadata';
import { UrlOpenActivityAction } from '@scion/workbench-application-platform.api';

/**
 * Button to open an URL in a separate browser tab.
 */
@Component({
  selector: 'wap-url-open-activity-action',
  templateUrl: './url-open-activity-action.component.html',
  styleUrls: ['./url-open-activity-action.component.scss'],
})
export class UrlOpenActivityActionComponent {

  constructor(@Inject(ACTIVITY_ACTION) public action: UrlOpenActivityAction) {
  }
}
