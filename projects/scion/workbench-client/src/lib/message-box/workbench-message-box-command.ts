/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable} from '../text/workbench-text-provider.model';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * Command to open a message box.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵWorkbenchMessageBoxCommand {
  title?: Translatable;
  actions?: {[key: string]: Translatable};
  severity?: 'info' | 'warn' | 'error';
  modality?: 'none' | 'context' | 'application';
  contentSelectable?: boolean;
  cssClass?: string | string[];
  context?: ViewId | PartId | DialogId | PopupId | NotificationId | null;
}

/**
 * Parameter name for the message displayed in the built-in text {@link WorkbenchMessageBoxCapability}.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export const eMESSAGE_BOX_MESSAGE_PARAM = 'message';
