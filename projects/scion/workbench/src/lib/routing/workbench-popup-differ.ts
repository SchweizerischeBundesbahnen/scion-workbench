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
import {UrlTree} from '@angular/router';
import {Routing} from './routing.util';

/**
 * Stateful differ for finding added/removed popups.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPopupDiffer {

  private _popupsDiffer: IterableDiffer<string>;

  constructor(differs: IterableDiffers) {
    this._popupsDiffer = differs.find([]).create<string>();
  }

  /**
   * Computes differences in the URL since last time {@link WorkbenchPopupDiffer#diff} was invoked.
   */
  public diff(urlTree: UrlTree): WorkbenchPopupDiff {
    const popupOutlets = Object.keys(urlTree.root.children).filter(Routing.isPopupOutlet);

    return new WorkbenchPopupDiff(this._popupsDiffer.diff(popupOutlets));
  }
}

/**
 * Lists the popups added/removed in the current navigation.
 */
export class WorkbenchPopupDiff {

  public readonly addedPopupOutlets = new Array<string>();
  public readonly removedPopupOutlets = new Array<string>();

  constructor(changes: IterableChanges<string> | null) {
    changes?.forEachAddedItem(({item}) => this.addedPopupOutlets.push(item));
    changes?.forEachRemovedItem(({item}) => this.removedPopupOutlets.push(item));
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedPopupOutlets.length ? `addedPopupOutlets=[${this.addedPopupOutlets}]` : [])
      .concat(this.removedPopupOutlets.length ? `removedPopupOutlets=[${this.removedPopupOutlets}]` : [])
      .join(', ')}`;
  }
}
