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
import {DIALOG_ID_PREFIX} from '../workbench.constants';

/**
 * Stateful differ for finding added/removed dialogs.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchDialogDiffer {

  private _dialogDiffer: IterableDiffer<string>;

  constructor(differs: IterableDiffers) {
    this._dialogDiffer = differs.find([]).create<string>();
  }

  /**
   * Computes differences in the URL since last time {@link WorkbenchDialogDiffer#diff} was invoked.
   */
  public diff(urlTree: UrlTree): WorkbenchDialogDiff {
    const dialogOutlets = Object.keys(urlTree.root.children).filter(outlet => outlet.startsWith(DIALOG_ID_PREFIX));

    return new WorkbenchDialogDiff(this._dialogDiffer.diff(dialogOutlets));
  }
}

/**
 * Lists the dialogs added/removed in the current navigation.
 */
export class WorkbenchDialogDiff {

  public readonly addedDialogOutlets = new Array<string>();
  public readonly removedDialogOutlets = new Array<string>();

  constructor(changes: IterableChanges<string> | null) {
    changes?.forEachAddedItem(({item}) => this.addedDialogOutlets.push(item));
    changes?.forEachRemovedItem(({item}) => this.removedDialogOutlets.push(item));
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedDialogOutlets.length ? `addedDialogOutlets=[${this.addedDialogOutlets}]` : [])
      .concat(this.removedDialogOutlets.length ? `removedDialogOutlets=[${this.removedDialogOutlets}]` : [])
      .join(', ')}`;
  }
}
