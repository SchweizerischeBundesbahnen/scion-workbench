/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, IterableChanges, IterableDiffers} from '@angular/core';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {UrlTree} from '@angular/router';
import {Routing} from './routing.util';
import {PartOutlet, ViewOutlet} from '../workbench.identifiers';

/**
 * Stateful differ to compute added and removed outlets.
 *
 * Use this differ to register/unregister auxiliary routes for added/removed outlets.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchOutletDiffer {

  private readonly _viewsDiffer = inject(IterableDiffers).find([]).create<ViewOutlet>();
  private readonly _partsDiffer = inject(IterableDiffers).find([]).create<PartOutlet>();

  /**
   * Computes differences since last time {@link WorkbenchOutletDiffer#diff} was invoked.
   */
  public diff(workbenchLayout: ɵWorkbenchLayout | null, urlTree: UrlTree): WorkbenchOutletDiff {
    // Combine view outlets from the URL and the layout, using a `Set` to remove duplicate entries.
    // We require both sources because the layout is not available during initial navigation, and
    // the URL does not contain outlets for empty-path navigations.
    const viewOutlets = new Set([
      ...Routing.parseOutlets(urlTree, {view: true}).keys(),
      ...workbenchLayout?.views().map(view => view.id) ?? [],
    ]);
    // Combine part outlets from the URL and the layout, using a `Set` to remove duplicate entries.
    // We require both sources because the layout is not available during initial navigation, and
    // the URL does not contain outlets for empty-path navigations.
    const partOutlets = new Set([
      ...Routing.parseOutlets(urlTree, {part: true}).keys(),
      ...workbenchLayout?.parts().map(part => part.id) ?? [],
    ]);

    return new WorkbenchOutletDiff({
      views: this._viewsDiffer.diff(viewOutlets),
      parts: this._partsDiffer.diff(partOutlets),
    });
  }
}

/**
 * Lists outlets added or removed in the current navigation.
 */
export class WorkbenchOutletDiff {

  public readonly addedViewOutlets = new Array<ViewOutlet>();
  public readonly removedViewOutlets = new Array<ViewOutlet>();

  public readonly addedPartOutlets = new Array<PartOutlet>();
  public readonly removedPartOutlets = new Array<PartOutlet>();

  constructor(changes: WorkbenchOutletChanges) {
    changes.views?.forEachAddedItem(({item}) => this.addedViewOutlets.push(item));
    changes.views?.forEachRemovedItem(({item}) => this.removedViewOutlets.push(item));
    changes.parts?.forEachAddedItem(({item}) => this.addedPartOutlets.push(item));
    changes.parts?.forEachRemovedItem(({item}) => this.removedPartOutlets.push(item));
  }

  public toString(): string {
    return new Array<string>()
      .concat(this.addedViewOutlets.length ? `addedViewOutlets=[${this.addedViewOutlets}]` : [])
      .concat(this.removedViewOutlets.length ? `removedViewOutlets=[${this.removedViewOutlets}]` : [])
      .concat(this.addedPartOutlets.length ? `addedPartOutlets=[${this.addedPartOutlets}]` : [])
      .concat(this.removedPartOutlets.length ? `removedPartOutlets=[${this.removedPartOutlets}]` : [])
      .join(', ');
  }
}

interface WorkbenchOutletChanges {
  views: IterableChanges<ViewOutlet> | null;
  parts: IterableChanges<PartOutlet> | null;
}
