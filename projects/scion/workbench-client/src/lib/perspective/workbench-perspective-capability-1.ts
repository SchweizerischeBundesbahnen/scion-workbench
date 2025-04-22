/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

export interface WorkbenchPerspectiveCapability2 extends Capability {
  type: WorkbenchCapabilities.Perspective;
  qualifier: Qualifier;
  properties: {
    layout: [Pick<WorkbenchPerspectivePart2, 'part'>, ...WorkbenchPerspectivePart2[]];
    data?: {[key: string]: unknown};
  };
}

export interface WorkbenchPerspectivePart2 {
  part: Qualifier;
  relativeTo?: Qualifier; // inline
  align: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
}

/**
 * Identifies the part that represents the main area.
 *
 * Refer to this part to align parts relative to the main area.
 */
export const MAIN_AREA: MAIN_AREA = 'part.main-area';

/**
 * Identifies the main area.
 */
export type MAIN_AREA = 'part.main-area';
