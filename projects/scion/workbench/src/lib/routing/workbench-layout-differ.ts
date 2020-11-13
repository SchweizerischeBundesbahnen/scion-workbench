/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, IterableChanges, IterableDiffer, IterableDiffers } from '@angular/core';
import { UrlTree } from '@angular/router';
import { VIEW_REF_PREFIX } from '../workbench.constants';
import { PartsLayout } from '../layout/parts-layout';

/**
 * Stateful differ for finding workbench layout changes, e.g., to find parts or views that were added or removed.
 */
@Injectable()
export class WorkbenchLayoutDiffer {

  private _viewOutletDiffer: IterableDiffer<string>;
  private _viewPartDiffer: IterableDiffer<string>;

  constructor(differs: IterableDiffers) {
    this._viewOutletDiffer = differs.find([]).create<string>();
    this._viewPartDiffer = differs.find([]).create<string>();
  }

  /**
   * Computes differences between the given layout and the layout as given in the last invocation.
   */
  public diff(urlTree: UrlTree, partsLayout?: PartsLayout): WorkbenchLayoutDiff {
    const viewOutletNames = Object.keys(urlTree.root.children).filter(outlet => outlet.startsWith(VIEW_REF_PREFIX));
    const partIds = partsLayout?.parts.map(part => part.partId) || [];

    return {
      viewOutletChanges: this._viewOutletDiffer.diff(viewOutletNames),
      partChanges: this._viewPartDiffer.diff(partIds),
    };
  }
}

/**
 * Describes changes in the layout since last time {@link WorkbenchLayoutDiffer#diff} was invoked.
 */
export interface WorkbenchLayoutDiff {
  partChanges: IterableChanges<string> | null;
  viewOutletChanges: IterableChanges<string> | null;
}
