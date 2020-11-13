/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { ɵWorkbenchViewPart } from './ɵworkbench-view-part.model';

/**
 * Registry for {@link WorkbenchViewPart} model objects.
 */
@Injectable()
export class WorkbenchViewPartRegistry {

  private readonly _viewPartRegistry = new Map<string, ɵWorkbenchViewPart>();

  public register(viewPart: ɵWorkbenchViewPart): void {
    this._viewPartRegistry.set(viewPart.partId, viewPart);
  }

  public remove(partId: string): void {
    this._viewPartRegistry.delete(partId);
  }

  /**
   * Returns the {@link WorkbenchViewPart} of the given identity, or throws an Error if not found.
   */
  public getElseThrow(partId: string): ɵWorkbenchViewPart {
    const viewPart = this._viewPartRegistry.get(partId);
    if (!viewPart) {
      throw Error(`[NullPartError] Part '${partId}' not found in the registry.`);
    }
    return viewPart;
  }
}
