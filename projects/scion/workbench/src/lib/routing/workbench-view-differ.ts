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
import {RouterUtils} from './router.util';
import {ViewId} from '../view/workbench-view.model';

/**
 * Stateful differ to compute view auxiliary routes.
 *
 * Use this differ to register/unregister view auxiliary routes.
 *
 * Because the layout is not available during initial navigation and empty-path views do not have
 * an outlet in the URL, this differ uses both, outlets in the URL and views in the layout.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchViewAuxiliaryRoutesDiffer {

  private _differ: IterableDiffer<ViewId>;

  constructor(differs: IterableDiffers) {
    this._differ = differs.find([]).create<ViewId>();
  }

  /**
   * Computes differences since last time {@link WorkbenchViewAuxiliaryRoutesDiffer#diff} was invoked.
   */
  public diff(workbenchLayout: ɵWorkbenchLayout | null, urlTree: UrlTree): WorkbenchViewAuxiliaryRoutesDiff {
    const views = workbenchLayout?.views().map(view => view.id) ?? [];
    const viewOutlets = RouterUtils.parseViewOutlets(urlTree).keys();
    return new WorkbenchViewAuxiliaryRoutesDiff({
      views: this._differ.diff(new Set([...viewOutlets, ...views])),
    });
  }
}

/**
 * Lists the auxiliary routes to register or unregister.
 */
export class WorkbenchViewAuxiliaryRoutesDiff {

  public readonly addedViews = new Array<ViewId>();
  public readonly removedViews = new Array<ViewId>();

  constructor(changes: {views: IterableChanges<ViewId> | null}) {
    changes.views?.forEachAddedItem(({item}) => this.addedViews.push(item));
    changes.views?.forEachRemovedItem(({item}) => this.removedViews.push(item));
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedViews.length ? `addViews=[${this.addedViews}]` : [])
      .concat(this.removedViews.length ? `removedViews=[${this.removedViews}]` : [])
      .join(', ')}`;
  }
}
