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

const URL_OPEN_ACTIVITY_ACTION = 'urlOpenAction';
const CUSTOM_ACTIVITY_ACTION = 'notifyAction';

@Component({
  selector: 'app-activity-actions-panel',
  templateUrl: './activity-actions-panel.component.html',
  styleUrls: ['./activity-actions-panel.component.scss'],
})
export class ActivityActionsPanelComponent {

  public readonly URL_OPEN_ACTIVITY_ACTION = URL_OPEN_ACTIVITY_ACTION;
  public readonly CUSTOM_ACTIVITY_ACTION = CUSTOM_ACTIVITY_ACTION;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      [URL_OPEN_ACTIVITY_ACTION]: formBuilder.control(true),
      [CUSTOM_ACTIVITY_ACTION]: formBuilder.control(true),
    });
  }
}

