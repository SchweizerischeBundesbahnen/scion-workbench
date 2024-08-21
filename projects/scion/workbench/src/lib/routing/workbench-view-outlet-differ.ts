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
import {UrlTree} from '@angular/router';
import {Routing} from './routing.util';
import {ViewId} from '../view/workbench-view.model';

/**
 * Stateful differ to compute view outlets.
 *
 * Use this differ to register/unregister view auxiliary routes.
 *
 * Because the layout is not available during initial navigation and empty-path views do not have
 * an outlet in the URL, this differ uses both, outlets in the URL and views in the layout.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchViewOutletDiffer {

  private _differ: IterableDiffer<ViewId>;

  constructor(differs: IterableDiffers) {
    this._differ = differs.find([]).create<ViewId>();
  }

  /**
   * Computes differences since last time {@link WorkbenchViewOutletDiffer#diff} was invoked.
   */
  public diff(workbenchLayout: ɵWorkbenchLayout | null, urlTree: UrlTree): WorkbenchViewOutletDiff {
    const views = workbenchLayout?.views().map(view => view.id) ?? [];
    const viewOutlets = Routing.parseViewOutlets(urlTree).keys();
    const changes = this._differ.diff(new Set([...viewOutlets, ...views]));
    return new WorkbenchViewOutletDiff(changes);
  }
}

/**
 * Lists the view outlets added/removed in the current navigation.
 */
export class WorkbenchViewOutletDiff {

  public readonly addedViewOutlets = new Array<ViewId>();
  public readonly removedViewOutlets = new Array<ViewId>();

  constructor(changes: IterableChanges<ViewId> | null) {
    changes?.forEachAddedItem(({item}) => this.addedViewOutlets.push(item));
    changes?.forEachRemovedItem(({item}) => this.removedViewOutlets.push(item));
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedViewOutlets.length ? `addedViewOutlets=[${this.addedViewOutlets}]` : [])
      .concat(this.removedViewOutlets.length ? `removedViewOutlets=[${this.removedViewOutlets}]` : [])
      .join(', ')}`;
  }
}
