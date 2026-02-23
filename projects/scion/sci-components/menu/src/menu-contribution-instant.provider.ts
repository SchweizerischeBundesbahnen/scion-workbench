/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';

/**
 * Provides instants for the contribution of menu items.
 *
 * Two consecutive calls always have different instants, in ascending order.
 */
@Injectable({providedIn: 'root'})
export class SciMenuContributionInstantProvider {

  private _instant = 0;

  /**
   * Provides the next instant.
   */
  public next(): number {
    return ++this._instant;
  }
}
