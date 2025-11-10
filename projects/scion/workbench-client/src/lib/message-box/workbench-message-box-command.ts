/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable} from '../text/workbench-text-provider.model';
import {DialogId, PartId, PopupId, ViewId} from '../workbench.identifiers';

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
  modality?: 'none' | 'context' | 'application' | ViewModality;
  contentSelectable?: boolean;
  cssClass?: string | string[];
  context?: ViewId | PartId | DialogId | PopupId | Context | null;
}

/**
 * @deprecated since version 1.0.0-beta.34. Renamed to `context`. Marked for removal.
 */
type ViewModality = 'view';

/**
 * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
 */
interface Context {
  /**
   * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
   */
  viewId?: ViewId | null;
}
