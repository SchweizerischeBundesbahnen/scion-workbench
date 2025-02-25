/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {isPartId, ɵWorkbenchLayout} from './ɵworkbench-layout';
import {MPart, MPartGrid} from './workbench-layout.model';
import {WorkbenchLayoutFactory} from './workbench-layout.factory';
import {EnvironmentInjector, inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {MAIN_AREA, MAIN_AREA_ALTERNATIVE_ID} from './workbench-layout';
import {NavigationStates, Outlets} from '../routing/routing.model';
import {WorkbenchLayouts} from './workbench-layouts.util';

/**
 * @inheritDoc
 */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchLayoutFactory implements WorkbenchLayoutFactory {

  private readonly _environmentInjector = inject(EnvironmentInjector);

  /**
   * @inheritDoc
   */
  public addPart(id: string | MAIN_AREA): ɵWorkbenchLayout {
    const partId = isPartId(id) ? id : (id === MAIN_AREA_ALTERNATIVE_ID ? MAIN_AREA : WorkbenchLayouts.computePartId());
    const alternativeId = isPartId(id) ? (id === MAIN_AREA ? MAIN_AREA_ALTERNATIVE_ID : undefined) : id;

    return this.create({
      workbenchGrid: {root: new MPart({id: partId, alternativeId, structural: true, views: []}), activePartId: partId},
    });
  }

  /**
   * Creates a workbench layout that consists of the specified grids.
   *
   * - If not specifying the workbench grid, creates a workbench grid with a main area.
   * - If not specifying the main area grid, but the workbench grid has a main area part, creates a main area grid with an initial part.
   *   To control the identity of the initial part, pass an injector and set the DI token {@link MAIN_AREA_INITIAL_PART_ID}.
   * - Grids and outlets can be passed in serialized or deserialized form.
   */
  public create(options?: {workbenchGrid?: string | MPartGrid | null; mainAreaGrid?: string | MPartGrid | null; perspectiveId?: string; outlets?: Outlets | string; navigationStates?: NavigationStates; injector?: Injector; maximized?: boolean}): ɵWorkbenchLayout {
    return runInInjectionContext(options?.injector ?? this._environmentInjector, () => new ɵWorkbenchLayout({
      workbenchGrid: options?.workbenchGrid,
      mainAreaGrid: options?.mainAreaGrid,
      perspectiveId: options?.perspectiveId,
      maximized: options?.maximized,
      outlets: options?.outlets,
      navigationStates: options?.navigationStates,
    }));
  }
}
