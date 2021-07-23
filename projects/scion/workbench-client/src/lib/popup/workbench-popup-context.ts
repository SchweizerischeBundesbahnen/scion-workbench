/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPopupCapability} from './workbench-popup-capability';

/**
 * Information about the popup embedding a microfrontend.
 *
 * This object can be obtained from the {@link ContextService} using the name {@link ɵPOPUP_CONTEXT}.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export interface ɵPopupContext {
  popupId: string;
  params: Map<string, any>;
  capability: WorkbenchPopupCapability;
  closeOnFocusLost: boolean;
}

/**
 * Key for obtaining the current popup context using {@link ContextService}.
 *
 * The popup context is only available to microfrontends loaded in a workbench popup.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 * @see {@link ContextService}
 * @see {@link ɵPopupContext}
 */
export const ɵPOPUP_CONTEXT = 'ɵworkbench.popup';
