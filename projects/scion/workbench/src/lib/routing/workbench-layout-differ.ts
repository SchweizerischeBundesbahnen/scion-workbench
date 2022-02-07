/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, IterableChanges, IterableDiffer, IterableDiffers} from '@angular/core';
import {UrlTree} from '@angular/router';
import {POPUP_REF_PREFIX, VIEW_REF_PREFIX} from '../workbench.constants';
import {PartsLayout} from '../layout/parts-layout';

/**
 * Stateful differ for finding workbench layout changes, e.g., to find parts or named outlets that were added or removed.
 */
@Injectable()
export class WorkbenchLayoutDiffer {

  private _viewOutletDiffer: IterableDiffer<string>;
  private _popupOutletDiffer: IterableDiffer<string>;
  private _viewPartDiffer: IterableDiffer<string>;

  constructor(differs: IterableDiffers) {
    this._viewOutletDiffer = differs.find([]).create<string>();
    this._popupOutletDiffer = differs.find([]).create<string>();
    this._viewPartDiffer = differs.find([]).create<string>();
  }

  /**
   * Computes differences between the given layout and the layout as given in the last invocation.
   */
  public diff(urlTree: UrlTree, partsLayout?: PartsLayout): WorkbenchLayoutDiff {
    const viewOutletNames = Object.keys(urlTree.root.children).filter(outlet => outlet.startsWith(VIEW_REF_PREFIX));
    const popupOutletNames = Object.keys(urlTree.root.children).filter(outlet => outlet.startsWith(POPUP_REF_PREFIX));
    const partIds = partsLayout?.parts.map(part => part.partId) || [];

    return new WorkbenchLayoutDiff(
      this._viewOutletDiffer.diff(viewOutletNames),
      this._popupOutletDiffer.diff(popupOutletNames),
      this._viewPartDiffer.diff(partIds),
    );
  }
}

/**
 * Describes changes in the layout since last time {@link WorkbenchLayoutDiffer#diff} was invoked.
 */
export class WorkbenchLayoutDiff {

  public addedViews: string[];
  public removedViews: string[];

  public addedPopups: string[];
  public removedPopups: string[];

  public addedParts: string[];
  public removedParts: string[];

  constructor(viewChanges: IterableChanges<string> | null,
              popupChanges: IterableChanges<string> | null,
              partChanges: IterableChanges<string> | null) {
    ({addedItems: this.addedViews, removedItems: this.removedViews} = this.collectChangedItems(viewChanges));
    ({addedItems: this.addedPopups, removedItems: this.removedPopups} = this.collectChangedItems(popupChanges));
    ({addedItems: this.addedParts, removedItems: this.removedParts} = this.collectChangedItems(partChanges));
  }

  private collectChangedItems(changes: IterableChanges<string> | null): {addedItems: string[]; removedItems: string[]} {
    const addedItems: string[] = [];
    const removedItems: string[] = [];
    changes?.forEachAddedItem(({item}) => addedItems.push(item));
    changes?.forEachRemovedItem(({item}) => removedItems.push(item));
    return {addedItems, removedItems};
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedParts.length ? `addedParts=[${this.addedParts}]` : [])
      .concat(this.removedParts.length ? `removedParts=[${this.removedParts}]` : [])
      .concat(this.addedViews.length ? `addedViews=[${this.addedViews}]` : [])
      .concat(this.removedViews.length ? `removedViews=[${this.removedViews}]` : [])
      .concat(this.addedPopups.length ? `addedPopups=[${this.addedPopups}]` : [])
      .concat(this.removedPopups.length ? `removedPopups=[${this.removedPopups}]` : [])
      .join(', ')}`;
  }
}
