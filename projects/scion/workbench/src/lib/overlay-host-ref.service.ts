/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, ViewContainerRef } from '@angular/core';

/**
 * Represents the location in the DOM where to append overlays to cover other elements.
 */
@Injectable()
export class OverlayHostRef {

  private _vcr: ViewContainerRef;

  public set(vcr: ViewContainerRef): void {
    if (this._vcr) {
      throw Error('`ViewContainerRef` already set');
    }
    this._vcr = vcr;
  }

  public get(): ViewContainerRef {
    return this._vcr;
  }
}
