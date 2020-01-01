/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { UUID } from '@scion/toolkit/util';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class TestingAppService {
  /**
   * Unique identity of the running app instance.
   */
  public readonly appInstanceId = UUID.randomUUID();
}
