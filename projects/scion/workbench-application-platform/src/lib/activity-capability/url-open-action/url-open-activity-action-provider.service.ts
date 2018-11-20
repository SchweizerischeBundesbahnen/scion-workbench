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
import { ActivityActionProvider } from '../metadata';
import { UrlOpenActivityActionComponent } from './url-open-activity-action.component';
import { PlatformActivityActionTypes } from '@scion/workbench-application-platform.api';

/**
 * Provides a button to open an URL in a separate browser tab.
 */
@Injectable()
export class UrlOpenActivityActionProvider implements ActivityActionProvider {
  public type = PlatformActivityActionTypes.UrlOpen;
  public component = UrlOpenActivityActionComponent;
}

