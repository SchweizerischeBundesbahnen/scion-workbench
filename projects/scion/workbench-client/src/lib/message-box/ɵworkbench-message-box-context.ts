/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchMessageBoxCapability} from '../message-box/workbench-message-box-capability';
import {DialogId} from '../workbench.identifiers';

/**
 * Information about the message box embedding a microfrontend.
 *
 * This object can be obtained from the {@link ContextService} using the name {@link ɵMESSAGE_BOX_CONTEXT}.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export interface ɵMessageBoxContext {
  dialogId: DialogId;
  capability: WorkbenchMessageBoxCapability;
  params: Map<string, unknown>;
}

/**
 * Key for obtaining the current message box context using {@link ContextService}.
 *
 * The message box context is only available to microfrontends loaded in a workbench message box.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 * @see {@link ContextService}
 * @see {@link ɵMessageBoxContext}
 */
export const ɵMESSAGE_BOX_CONTEXT = 'ɵworkbench.message-box';
