/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {isPartId, WorkbenchLayoutConstructConfig, ɵWorkbenchLayout} from './ɵworkbench-layout';
import {MPart} from './workbench-layout.model';
import {WorkbenchLayoutFactory} from './workbench-layout.factory';
import {Injectable, Injector, runInInjectionContext} from '@angular/core';
import {MAIN_AREA, MAIN_AREA_ALTERNATIVE_ID} from './workbench-layout';
import {WorkbenchLayouts} from './workbench-layouts.util';

/**
 * @inheritDoc
 */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchLayoutFactory implements WorkbenchLayoutFactory {

  constructor(private _injector: Injector) {
  }

  /**
   * @inheritDoc
   */
  public addPart(id: string | MAIN_AREA): ɵWorkbenchLayout {
    const partId = isPartId(id) ? id : (id === MAIN_AREA_ALTERNATIVE_ID ? MAIN_AREA : WorkbenchLayouts.computePartId());
    const alternativeId = isPartId(id) ? (id === MAIN_AREA ? MAIN_AREA_ALTERNATIVE_ID : undefined) : id;

    return this.create({
      grids: {
        main: {root: new MPart({id: partId, alternativeId, structural: true, views: []}), activePartId: partId},
      },
    });
  }

  /**
   * Creates a workbench layout that consists of the specified grids.
   *
   * @see ɵWorkbenchLayout.constructor
   */
  public create(config?: WorkbenchLayoutConstructConfig): ɵWorkbenchLayout {
    return runInInjectionContext(this._injector, () => new ɵWorkbenchLayout(config));
  }
}
