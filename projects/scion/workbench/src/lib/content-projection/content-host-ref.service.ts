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
 * Represents the location in the DOM where to append content of views or activities, whose DOM elements
 * are not allowed to be moved within the DOM or detached/re-attached during their lifecycle. This would
 * happen when workbench views are rearranged or activities toggled.
 *
 * Instead, content is added to a top-level workbench DOM element and its content projected into the container's bounding box.
 * To not cover other parts of the workbench (e.g. sashes or view dropdown), they are placed upfront in the DOM.
 *
 * For instance, an iframe would reload once it is reparented in the DOM.
 */
@Injectable()
export class ContentHostRef {

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
