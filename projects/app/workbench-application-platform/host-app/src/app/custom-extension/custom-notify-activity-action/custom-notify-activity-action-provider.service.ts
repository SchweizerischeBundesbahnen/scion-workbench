/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { ActivityActionProvider } from '@scion/workbench-application-platform';
import { CustomNotifyActivityActionComponent } from './custom-notify-activity-action.component';
import { CustomActivityActionTypes } from '@scion/app/common';

@Injectable()
export class CustomNotifyActivityActionProvider implements ActivityActionProvider {
  public type = CustomActivityActionTypes.CustomNotify;
  public component = CustomNotifyActivityActionComponent;
}

