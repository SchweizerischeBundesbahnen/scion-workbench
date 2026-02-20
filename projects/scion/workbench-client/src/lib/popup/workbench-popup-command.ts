/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * Command to open a popup.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵWorkbenchPopupCommand {
  popupId: PopupId;
  align?: 'east' | 'west' | 'north' | 'south';
  closeStrategy?: {
    onFocusLost?: boolean;
    onEscape?: boolean;
  };
  cssClass?: string | string[];
  context?: ViewId | PartId | DialogId | PopupId | NotificationId | Context | null;
}

/**
 * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
 */
interface Context {
  /**
   * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
   */
  viewId?: ViewId | null;
}
