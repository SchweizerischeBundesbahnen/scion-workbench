/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchDialogCapability} from './workbench-dialog-capability';
import {DialogId} from '../workbench.identifiers';

/**
 * Context when displaying a microfrontend in a dialog.
 *
 * This object can be obtained from the {@link ContextService} using the name {@link ɵDIALOG_CONTEXT}.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵDialogContext {
  dialogId: DialogId;
  capability: WorkbenchDialogCapability;
  params: Map<string, unknown>;
}

/**
 * Key for obtaining the current dialog context using {@link ContextService}.
 *
 * The dialog context is only available to microfrontends loaded in a workbench dialog.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 * @see {@link ContextService}
 * @see {@link ɵDialogContext}
 */
export const ɵDIALOG_CONTEXT = 'ɵworkbench.dialog';
