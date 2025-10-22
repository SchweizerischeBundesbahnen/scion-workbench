/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {PartId} from '../workbench.identifiers';
import {WorkbenchPartCapability} from './workbench-part-capability';

/**
 * Context when displaying a microfrontend in a part.
 *
 * This object can be obtained from the {@link ContextService} using the name {@link ɵWORKBENCH_PART_CONTEXT}.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵWorkbenchPartContext {
  partId: PartId;
  capability: WorkbenchPartCapability;
  params: Map<string, unknown>;
}

/**
 * Key for obtaining the current part context using {@link ContextService}.
 *
 * The part context is only available to microfrontends loaded in a workbench part.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 * @see {@link ContextService}
 * @see {@link ɵDialogContext}
 */
export const ɵWORKBENCH_PART_CONTEXT = 'ɵworkbench.part';
