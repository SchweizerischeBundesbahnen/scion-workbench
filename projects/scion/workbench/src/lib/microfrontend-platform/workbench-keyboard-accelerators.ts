/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciKeyboardAccelerator} from '@scion/components/menu';

/**
 * Global accelerators used by the SCION Workbench.
 */
export const workbenchKeyboardAccelerators: SciKeyboardAccelerator[] = [
  {key: 'Escape'}, // to close notifications
  {ctrl: true, shift: true, key: 'F12'}, // to minimize activities
];
