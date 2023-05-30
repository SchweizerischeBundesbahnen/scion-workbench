/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';

/**
 * Provides instants for the activation of workbench components like parts or views.
 */
@Injectable({providedIn: 'root'})
export class ActivationInstantProvider {

  /**
   * Provides the current instant.
   */
  public now(): number {
    return Date.now();
  }
}
