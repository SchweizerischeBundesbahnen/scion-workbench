/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {MPartGrid} from './workbench-layout.model';
import {WorkbenchAccessor, ɵWorkbenchLayout} from './ɵworkbench-layout';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchLayoutSerializer} from './workench-layout-serializer.service';

/**
 * Factory for creating a layout instance.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutFactory {

  private readonly _workbenchAccessor: WorkbenchAccessor;

  constructor(viewRegistry: WorkbenchViewRegistry,
              partRegistry: WorkbenchPartRegistry,
              serializer: WorkbenchLayoutSerializer,
              @Optional() @Inject(WORKBENCH_LAYOUT_INITIAL_PART_ID) initialPartId?: string) {
    this._workbenchAccessor = new class implements WorkbenchAccessor {

      public serializer = serializer;

      public getViewActivationInstant(viewId: string): number {
        return viewRegistry.get(viewId, {orElse: null})?.activationInstant ?? 0;
      }

      public getPartActivationInstant(partId: string): number {
        return partRegistry.get(partId, {orElse: null})?.activationInstant ?? 0;
      }

      public getInitialPartId(): string {
        return initialPartId ?? DEFAULT_INITIAL_PART_ID;
      }
    };
  }

  /**
   * Creates an immutable {@link WorkbenchLayout} instance of the given layout.
   * If not passing a grid, creates a main area with an initial part.
   */
  public create(config?: {mainGrid?: string | MPartGrid | null; peripheralGrid?: string | MPartGrid | null; maximized?: boolean}): ɵWorkbenchLayout {
    return new ɵWorkbenchLayout({...config, workbenchAccessor: this._workbenchAccessor});
  }
}

/**
 * DI token that can be used in tests to specify the identity of the initial part in the main area.
 *
 * The initial part is automatically created by the workbench if the main area has no part, but it has no
 * special meaning to the workbench and can be removed by the user. If not set, a UUID is assigned.
 */
export const WORKBENCH_LAYOUT_INITIAL_PART_ID = new InjectionToken<string>('WORKBENCH_LAYOUT_INITIAL_PART_ID');

/**
 * Unique identity of the initial part in the main area.
 *
 * The initial part is automatically created by the workbench if the main area has no part, but it has no
 * special meaning to the workbench and can be removed by the user.
 *
 * We use a stable id to avoid recreating it in the DOM on every layout change if the main area has no part.
 * Otherwise, views cannot be dragged into the main area because its drop zone would be destroyed during drag
 * and drop.
 */
const DEFAULT_INITIAL_PART_ID = UUID.randomUUID();
