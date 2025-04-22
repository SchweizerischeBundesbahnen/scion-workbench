/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, ParamDefinition, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Translatable} from '@scion/workbench';

export interface WorkbenchPartCapability extends Capability {
  type: WorkbenchCapabilities.Part;
  qualifier: Qualifier;
  params?: ParamDefinition[];
  properties: {
    path?: string;
    views?: WorkbenchPerspectiveView2[];
    title?: Translatable;
    showSplash?: boolean;
    cssClass?: string | string[];
    [key: string]: unknown;
    dockItem: {
      icon: string;
      label: Translatable;
      tooltip?: Translatable;
    }
  };
}

export interface WorkbenchActivityCapability extends Capability {
  type: WorkbenchCapabilities.Activity;
  qualifier: Qualifier;
  params?: ParamDefinition[];
  properties: {
    path?: string;
    views?: WorkbenchPerspectiveView2[];
    // parts?: WorkbenchPerspectivePart2[],
    icon: string;
    label: Translatable;
    tooltip?: Translatable;
    title?: Translatable;
    showSplash?: boolean;
    cssClass?: string | string[];
    [key: string]: unknown;
  };
}

export interface WorkbenchPerspectiveView2 {
  qualifier: Qualifier;
  params?: {[name: string]: unknown};
  active?: boolean;
  cssClass?: string | string[];
}

export interface WorkbenchPerspectivePart2 {
  part: Qualifier; // PartCapability (keine DockedPart)
  relativeTo?: Qualifier;
  align: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
}


