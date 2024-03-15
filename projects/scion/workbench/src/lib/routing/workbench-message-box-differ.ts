/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, IterableChanges, IterableDiffer, IterableDiffers} from '@angular/core';
import {UrlTree} from '@angular/router';
import {RouterUtils} from './router.util';

/**
 * Stateful differ for finding added/removed message boxes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchMessageBoxDiffer {

  private _messageBoxDiffer: IterableDiffer<string>;

  constructor(differs: IterableDiffers) {
    this._messageBoxDiffer = differs.find([]).create<string>();
  }

  /**
   * Computes differences in the URL since last time {@link WorkbenchMessageBoxDiffer#diff} was invoked.
   */
  public diff(urlTree: UrlTree): WorkbenchMessageBoxDiff {
    const messageBoxOutlets = Object.keys(urlTree.root.children).filter(RouterUtils.isMessageBoxOutlet);

    return new WorkbenchMessageBoxDiff(this._messageBoxDiffer.diff(messageBoxOutlets));
  }
}

/**
 * Lists the message boxes added/removed in the current navigation.
 */
export class WorkbenchMessageBoxDiff {

  public readonly addedMessageBoxOutlets = new Array<string>();
  public readonly removedMessageBoxOutlets = new Array<string>();

  constructor(changes: IterableChanges<string> | null) {
    changes?.forEachAddedItem(({item}) => this.addedMessageBoxOutlets.push(item));
    changes?.forEachRemovedItem(({item}) => this.removedMessageBoxOutlets.push(item));
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedMessageBoxOutlets.length ? `addedMessageBoxOutlets=[${this.addedMessageBoxOutlets}]` : [])
      .concat(this.removedMessageBoxOutlets.length ? `removedMessageBoxOutlets=[${this.removedMessageBoxOutlets}]` : [])
      .join(', ')}`;
  }
}
