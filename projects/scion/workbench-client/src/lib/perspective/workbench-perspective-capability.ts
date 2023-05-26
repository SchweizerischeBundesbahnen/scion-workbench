/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Dictionary} from '@scion/toolkit/util';

export interface WorkbenchPerspectiveCapability extends Capability {

  type: WorkbenchCapabilities.Perspective;

  qualifier: Qualifier;

  properties: {
   layout: LayoutDefinition;
   data: Dictionary;
  };
}

export interface LayoutDefinition {
  parts: PartDefinition[];
}

export interface PartDefinition {
  id: string;
  relativeTo?: string;
  align: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  activate?: boolean;
}

