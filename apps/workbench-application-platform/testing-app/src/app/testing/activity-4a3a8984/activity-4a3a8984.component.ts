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
import { provideWorkbenchActivity } from '@scion/workbench-application.angular';
import { UUID } from '@scion/workbench-application.core';

@Component({
  selector: 'app-activity-4a3a8984',
  templateUrl: './activity-4a3a8984.component.html',
  styleUrls: ['./activity-4a3a8984.component.scss'],
  providers: [
    provideWorkbenchActivity(Activity4a3a8984Component),
  ],
})
export class Activity4a3a8984Component {

  public uuid = UUID.randomUUID();
}
