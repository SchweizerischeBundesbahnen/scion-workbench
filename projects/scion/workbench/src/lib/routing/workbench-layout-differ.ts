/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, IterableChanges, IterableDiffer, IterableDiffers} from '@angular/core';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {ViewId} from '../view/workbench-view.model';
import {PartId} from '../part/workbench-part.model';

/**
 * Stateful differ for finding added/removed workbench layout elements.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutDiffer {

  private _partsDiffer: IterableDiffer<PartId>;
  private _viewsDiffer: IterableDiffer<ViewId>;

  constructor() {
    const differs = inject(IterableDiffers);

    this._partsDiffer = differs.find([]).create<PartId>();
    this._viewsDiffer = differs.find([]).create<ViewId>();
  }

  /**
   * Computes differences in the layout since last time {@link WorkbenchLayoutDiffer#diff} was invoked.
   */
  public diff(workbenchLayout: ɵWorkbenchLayout | null): WorkbenchLayoutDiff {
    const parts = workbenchLayout?.parts().map(part => part.id);
    const views = workbenchLayout?.views().map(view => view.id);
    return new WorkbenchLayoutDiff({
      parts: this._partsDiffer.diff(parts),
      views: this._viewsDiffer.diff(views),
    });
  }
}

/**
 * Lists the layout elements added/removed in the current navigation.
 */
export class WorkbenchLayoutDiff {

  public readonly addedParts = new Array<PartId>();
  public readonly removedParts = new Array<PartId>();

  public readonly addedViews = new Array<ViewId>();
  public readonly removedViews = new Array<ViewId>();

  constructor(changes: {parts: IterableChanges<PartId> | null; views: IterableChanges<ViewId> | null}) {
    changes.parts?.forEachAddedItem(({item}) => this.addedParts.push(item));
    changes.parts?.forEachRemovedItem(({item}) => this.removedParts.push(item));

    changes.views?.forEachAddedItem(({item}) => this.addedViews.push(item));
    changes.views?.forEachRemovedItem(({item}) => this.removedViews.push(item));
  }

  public toString(): string {
    return new Array<string>()
      .concat(this.addedParts.length ? `addedParts=[${this.addedParts}]` : [])
      .concat(this.removedParts.length ? `removedParts=[${this.removedParts}]` : [])
      .concat(this.addedViews.length ? `addedViews=[${this.addedViews}]` : [])
      .concat(this.removedViews.length ? `removedViews=[${this.removedViews}]` : [])
      .join(', ');
  }
}
