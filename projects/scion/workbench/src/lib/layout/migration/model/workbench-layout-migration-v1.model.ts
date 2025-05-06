/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Commands} from '../../../routing/routing.model';

export interface PerspectiveDataV1 {
  initialWorkbenchGrid: string;
  workbenchGrid: string;
  viewOutlets: {[viewId: string]: Commands};
}
