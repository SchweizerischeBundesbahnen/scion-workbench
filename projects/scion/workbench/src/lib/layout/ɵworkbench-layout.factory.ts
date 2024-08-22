/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {MPart, MPartGrid} from './workbench-layout.model';
import {WorkbenchLayoutFactory} from './workbench-layout.factory';
import {EnvironmentInjector, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {MAIN_AREA} from './workbench-layout';
import {NavigationStates, ViewOutlets} from '../routing/routing.model';

/**
 * @inheritDoc
 */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchLayoutFactory implements WorkbenchLayoutFactory {

  constructor(private _environmentInjector: EnvironmentInjector) {
  }

  /**
   * @inheritDoc
   */
  public addPart(id: string | MAIN_AREA): ɵWorkbenchLayout {
    return this.create({
      workbenchGrid: {root: new MPart({id, structural: true, views: []}), activePartId: id},
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
  public create(options?: {workbenchGrid?: string | MPartGrid | null; mainAreaGrid?: string | MPartGrid | null; viewOutlets?: ViewOutlets | string; navigationStates?: NavigationStates; injector?: Injector; maximized?: boolean}): ɵWorkbenchLayout {
    return runInInjectionContext(options?.injector ?? this._environmentInjector, () => new ɵWorkbenchLayout({
      workbenchGrid: options?.workbenchGrid,
      mainAreaGrid: options?.mainAreaGrid,
      maximized: options?.maximized,
      viewOutlets: options?.viewOutlets,
      navigationStates: options?.navigationStates,
    }));
  }
}
