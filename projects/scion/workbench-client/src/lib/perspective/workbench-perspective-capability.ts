/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

export interface WorkbenchPerspectiveCapability extends Capability {
  type: WorkbenchCapabilities.Perspective;

  properties: {
    parts: WorkbenchPerspectivePartContribution[];
    data: {[key: string]: any};
  };
}

// TODO [mfp-perspective] Consider using another name. Note that this symbol will by exported under @scion/workbench-client.
export interface WorkbenchPerspectivePartContribution {
  id: string;
  relativeTo?: string;
  align: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
}

