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
import {ɵWorkbenchLayoutFactory} from './ɵworkbench-layout.factory';
import {MAIN_AREA, WorkbenchLayout} from './workbench-layout';

/**
 * Factory for creating a {@link WorkbenchLayout}.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchLayoutFactory})
export abstract class WorkbenchLayoutFactory {

  /**
   * Creates a layout with given part.
   *
   * @param id - The id of the part. Use {@link MAIN_AREA} to add the main area.
   * @param options - Controls how to add the part to the layout.
   *        @property activate - Controls whether to activate the part. If not set, defaults to `false`.
   * @return layout with the part added.
   */
  public abstract addPart(id: string | MAIN_AREA, options?: {activate?: boolean}): WorkbenchLayout;
}
