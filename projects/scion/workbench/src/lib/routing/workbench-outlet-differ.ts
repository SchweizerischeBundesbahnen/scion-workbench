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
 * Stateful differ to compute part and view outlets.
 *
 * Use this differ to register/unregister auxiliary routes for parts and views..
 *
 * Because the layout is not available during initial navigation and empty-path views do not have
 * an outlet in the URL, this differ uses both, outlets in the URL and views in the layout.
 *
 * TODO [activity] Should we also handle popup outlets diff here?
 */
@Injectable({providedIn: 'root'})
export class WorkbenchOutletDiffer {

  private _partsDiffer: IterableDiffer<string>;
  private _viewsDiffer: IterableDiffer<ViewId>;

  constructor(differs: IterableDiffers) {
    this._partsDiffer = differs.find([]).create<string>();
    this._viewsDiffer = differs.find([]).create<ViewId>();
  }

  /**
   * Computes differences since last time {@link WorkbenchOutletDiffer#diff} was invoked.
   */
  public diff(workbenchLayout: ɵWorkbenchLayout | null, urlTree: UrlTree): WorkbenchOutletDiff {
    const parts = workbenchLayout?.parts().map(part => part.id) ?? [];
    const views = workbenchLayout?.views().map(view => view.id) ?? [];

    const partOutlets = Routing.parseOutlets(urlTree, {part: true}).keys();
    const viewOutlets = Routing.parseOutlets(urlTree, {view: true}).keys();

    return new WorkbenchOutletDiff({
      parts: this._partsDiffer.diff(new Set([...partOutlets, ...parts])),
      views: this._viewsDiffer.diff(new Set([...viewOutlets, ...views])),
    });
  }
}

/**
 * Lists the outlets added/removed in the current navigation.
 */
export class WorkbenchOutletDiff {

  public readonly addedPartOutlets = new Array<string>();
  public readonly removedPartOutlets = new Array<string>();
  public readonly addedViewOutlets = new Array<ViewId>();
  public readonly removedViewOutlets = new Array<ViewId>();

  constructor(changes: {parts: IterableChanges<string> | null; views: IterableChanges<ViewId> | null}) {
    changes.parts?.forEachAddedItem(({item}) => this.addedPartOutlets.push(item));
    changes.parts?.forEachRemovedItem(({item}) => this.removedPartOutlets.push(item));

    changes.views?.forEachAddedItem(({item}) => this.addedViewOutlets.push(item));
    changes.views?.forEachRemovedItem(({item}) => this.removedViewOutlets.push(item));
  }

  public toString(): string {
    return `${new Array<string>()
      .concat(this.addedPartOutlets.length ? `addedPartOutlets=[${this.addedPartOutlets}]` : [])
      .concat(this.removedPartOutlets.length ? `removedPartOutlets=[${this.removedPartOutlets}]` : [])
      .concat(this.addedViewOutlets.length ? `addedViewOutlets=[${this.addedViewOutlets}]` : [])
      .concat(this.removedViewOutlets.length ? `removedViewOutlets=[${this.removedViewOutlets}]` : [])
      .join(', ')}`;
  }
}
