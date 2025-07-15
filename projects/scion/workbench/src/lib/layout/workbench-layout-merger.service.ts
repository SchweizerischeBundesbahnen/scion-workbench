/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Injectable} from '@angular/core';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {LayoutSerializationFlags} from './workbench-layout-serializer.service';

/**
 * Performs a three-way merge of the local and remote layouts, using the base layout (common ancestor) as the base of the merge operation.
 *
 * TODO [#452] This implementation discards local changes when a new layout is available.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMerger {

  /**
   * Performs a merge of given local and remote layouts, using the base layout as the common ancestor.
   */
  public merge(layouts: {local: ɵWorkbenchLayout; remote: ɵWorkbenchLayout; base: ɵWorkbenchLayout}): ɵWorkbenchLayout {
    if (!layouts.base.equals(layouts.remote, compareFlags)) {
      return layouts.remote;
    }

    return layouts.local;
  }
}

/**
 * Flags to compare two layouts for equality.
 */
const compareFlags: LayoutSerializationFlags = {
  excludeTreeNodeId: true,
  excludePartNavigationId: true,
  excludeViewNavigationId: true,
  excludePartActivationInstant: true,
  excludeViewActivationInstant: true,
  assignStablePartIdentifier: true,
  assignStableViewIdentifier: true,
  assignStableActivityIdentifier: true,
  sort: true,
} as const;
