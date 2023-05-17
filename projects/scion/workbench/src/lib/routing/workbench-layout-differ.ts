/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, IterableChanges, IterableDiffer, IterableDiffers} from '@angular/core';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';

/**
 * Stateful differ for finding added/removed workbench layout elements.
 */
@Injectable()
export class WorkbenchLayoutDiffer {

  private _partsDiffer: IterableDiffer<string>;
  private _viewsDiffer: IterableDiffer<string>;

  constructor(differs: IterableDiffers) {
    this._partsDiffer = differs.find([]).create<string>();
    this._viewsDiffer = differs.find([]).create<string>();
  }

  /**
   * Computes differences in the layout since last time {@link WorkbenchLayoutDiffer#diff} was invoked.
   */
  public diff(workbenchLayout?: ɵWorkbenchLayout): WorkbenchLayoutDiff {
    const partIds = workbenchLayout?.parts().map(part => part.id) || [];
    const viewIds = workbenchLayout?.views().map(view => view.id) || [];

    return new WorkbenchLayoutDiff({
      parts: this._partsDiffer.diff(partIds),
      views: this._viewsDiffer.diff(viewIds),
    });
  }
}

/**
 * Lists the layout elements added/removed in the current navigation.
 */
export class WorkbenchLayoutDiff {

  public readonly addedParts = new Array<string>();
  public readonly removedParts = new Array<string>();

  public readonly addedViews = new Array<string>();
  public readonly removedViews = new Array<string>();

  constructor(changes: {parts: IterableChanges<string> | null; views: IterableChanges<string> | null}) {
    changes.parts?.forEachAddedItem(({item}) => this.addedParts.push(item));
    changes.parts?.forEachRemovedItem(({item}) => this.removedParts.push(item));

    changes.views?.forEachAddedItem(({item}) => this.addedViews.push(item));
    changes.views?.forEachRemovedItem(({item}) => this.removedViews.push(item));
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedParts.length ? `addedParts=[${this.addedParts}]` : [])
      .concat(this.removedParts.length ? `removedParts=[${this.removedParts}]` : [])
      .concat(this.addedViews.length ? `addedViews=[${this.addedViews}]` : [])
      .concat(this.removedViews.length ? `removedViews=[${this.removedViews}]` : [])
      .join(', ')}`;
  }
}
