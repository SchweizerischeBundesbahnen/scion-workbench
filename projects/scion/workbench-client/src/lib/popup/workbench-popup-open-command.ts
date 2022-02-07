/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CloseStrategy} from './workbench-popup.config';

/**
 * Command object for instructing the Workbench to open the microfrontend of given popup capability in a popup.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export interface ɵWorkbenchPopupCommand {
  popupId: string;
  align?: 'east' | 'west' | 'north' | 'south';
  closeStrategy?: CloseStrategy;
  context?: {
    viewId?: string;
  };
}
