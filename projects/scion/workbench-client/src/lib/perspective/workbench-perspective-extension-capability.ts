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

export interface WorkbenchPerspectiveExtensionCapability extends Capability {
  type: WorkbenchCapabilities.PerspectiveExtension;

  properties: {
    perspective: Qualifier;
    views: WorkbenchPerspectiveViewContribution[];
  };
}

export interface WorkbenchPerspectiveViewContribution {
  qualifier: Qualifier;
  partId: string;
  position?: number;
  active?: boolean;
}

