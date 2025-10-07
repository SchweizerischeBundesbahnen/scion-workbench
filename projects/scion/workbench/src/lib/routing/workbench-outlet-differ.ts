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
import {DialogOutlet, HostPartOutlet, HostViewOutlet, PartOutlet, PopupOutlet, ViewOutlet} from '../workbench.identifiers';
import {MicrofrontendPartNavigationData} from '../microfrontend-platform/microfrontend-part/microfrontend-part-navigation-data';

/**
 * Stateful differ to compute added and removed outlets.
 *
 * Use this differ to register/unregister auxiliary routes for added/removed outlets.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchOutletDiffer {

  private readonly _viewsDiffer = inject(IterableDiffers).find([]).create<ViewOutlet>();
  private readonly _hostViewsDiffer = inject(IterableDiffers).find([]).create<HostViewOutlet>();
  private readonly _partsDiffer = inject(IterableDiffers).find([]).create<PartOutlet>();
  private readonly _hostPartsDiffer = inject(IterableDiffers).find([]).create<HostPartOutlet>();
  private readonly _popupsDiffer = inject(IterableDiffers).find([]).create<PopupOutlet>();
  private readonly _dialogsDiffer = inject(IterableDiffers).find([]).create<DialogOutlet>();

  /**
   * Computes differences since last time {@link WorkbenchOutletDiffer#diff} was invoked.
   */
  public diff(workbenchLayout: ɵWorkbenchLayout | null, urlTree: UrlTree): WorkbenchOutletDiff {
    // Combine view outlets from the URL and the layout, using a `Set` to remove duplicate entries.
    // We require both sources because the layout is not available during initial navigation, and
    // the URL does not contain outlets for empty-path navigations.
    const viewOutlets = new Set([
      ...Routing.parseOutlets(urlTree, {view: true}).keys(),
      ...workbenchLayout?.views()?.map(view => view.id) ?? [],
    ]);
    const hostViewOutlets = new Set([
      ...Routing.parseOutlets(urlTree, {hostView: true}).keys(),
      ...workbenchLayout?.views().map(view => `host-${view.id}` as HostViewOutlet) ?? [],
    ]);
    // const hostViewOutlets = new Set([
    //   ...Routing.parseOutlets(urlTree, {hostView: true}).keys(),
    //   ...workbenchLayout?.views().filter(view => {
    //     const data = view.navigation?.data as unknown as MicrofrontendViewNavigationData | undefined;
    //     return data?.isHostProvider;
    //   }).map(view => `host-${view.id}` as HostViewOutlet) ?? [],
    // ]);
    // Combine part outlets from the URL and the layout, using a `Set` to remove duplicate entries.
    // We require both sources because the layout is not available during initial navigation, and
    // the URL does not contain outlets for empty-path navigations.
    const partOutlets = new Set([
      ...Routing.parseOutlets(urlTree, {part: true}).keys(),
      ...workbenchLayout?.parts().map(part => part.id) ?? [],
    ]);

    const hostPartOutlets = new Set([
      ...Routing.parseOutlets(urlTree, {hostPart: true}).keys(),
      ...workbenchLayout?.parts().filter(part => {
        const data = part.navigation?.data as unknown as MicrofrontendPartNavigationData | undefined;
        return data?.isHostProvider;
      }).map(part => `host-${part.id}` as HostPartOutlet) ?? [],
    ]);

    const popupOutlets = Routing.parseOutlets(urlTree, {popup: true}).keys();
    const dialogOutlets = Routing.parseOutlets(urlTree, {dialog: true}).keys();

    return new WorkbenchOutletDiff({
      views: this._viewsDiffer.diff(viewOutlets),
      hostViews: this._hostViewsDiffer.diff(hostViewOutlets),
      parts: this._partsDiffer.diff(partOutlets),
      hostParts: this._hostPartsDiffer.diff(hostPartOutlets),
      popups: this._popupsDiffer.diff(popupOutlets),
      dialogs: this._dialogsDiffer.diff(dialogOutlets),
    });
  }
}

/**
 * Lists outlets added or removed in the current navigation.
 */
export class WorkbenchOutletDiff {

  public readonly addedViewOutlets = new Array<ViewOutlet>();
  public readonly removedViewOutlets = new Array<ViewOutlet>();

  public readonly addedHostViewOutlets = new Array<HostViewOutlet>();
  public readonly removedHostViewOutlets = new Array<HostViewOutlet>();

  public readonly addedPartOutlets = new Array<PartOutlet>();
  public readonly removedPartOutlets = new Array<PartOutlet>();

  public readonly addedHostPartOutlets = new Array<HostPartOutlet>();
  public readonly removedHostPartOutlets = new Array<HostPartOutlet>();

  public readonly addedPopupOutlets = new Array<PopupOutlet>();
  public readonly removedPopupOutlets = new Array<PopupOutlet>();

  public readonly addedDialogOutlets = new Array<DialogOutlet>();
  public readonly removedDialogOutlets = new Array<DialogOutlet>();

  constructor(changes: WorkbenchOutletChanges) {
    changes.views?.forEachAddedItem(({item}) => this.addedViewOutlets.push(item));
    changes.views?.forEachRemovedItem(({item}) => this.removedViewOutlets.push(item));

    changes.hostViews?.forEachAddedItem(({item}) => this.addedHostViewOutlets.push(item));
    changes.hostViews?.forEachRemovedItem(({item}) => this.removedHostViewOutlets.push(item));

    changes.parts?.forEachAddedItem(({item}) => this.addedPartOutlets.push(item));
    changes.parts?.forEachRemovedItem(({item}) => this.removedPartOutlets.push(item));

    changes.hostParts?.forEachAddedItem(({item}) => this.addedHostPartOutlets.push(item));
    changes.hostParts?.forEachRemovedItem(({item}) => this.removedHostPartOutlets.push(item));

    changes.popups?.forEachAddedItem(({item}) => this.addedPopupOutlets.push(item));
    changes.popups?.forEachRemovedItem(({item}) => this.removedPopupOutlets.push(item));

    changes.dialogs?.forEachAddedItem(({item}) => this.addedDialogOutlets.push(item));
    changes.dialogs?.forEachRemovedItem(({item}) => this.removedDialogOutlets.push(item));
  }

  public toString(): string {
    return new Array<string>()
      .concat(this.addedViewOutlets.length ? `addedViewOutlets=[${this.addedViewOutlets}]` : [])
      .concat(this.removedViewOutlets.length ? `removedViewOutlets=[${this.removedViewOutlets}]` : [])

      .concat(this.addedHostViewOutlets.length ? `addedHostViewOutlets=[${this.addedHostViewOutlets}]` : [])
      .concat(this.removedHostViewOutlets.length ? `removedHostViewOutlets=[${this.removedHostViewOutlets}]` : [])

      .concat(this.addedPartOutlets.length ? `addedPartOutlets=[${this.addedPartOutlets}]` : [])
      .concat(this.removedPartOutlets.length ? `removedPartOutlets=[${this.removedPartOutlets}]` : [])

      .concat(this.addedHostPartOutlets.length ? `addedHostPartOutlets=[${this.addedHostPartOutlets}]` : [])
      .concat(this.removedHostPartOutlets.length ? `removedHostPartOutlets=[${this.removedHostPartOutlets}]` : [])

      .concat(this.addedPopupOutlets.length ? `addedPopupOutlets=[${this.addedPopupOutlets}]` : [])
      .concat(this.removedPopupOutlets.length ? `removedPopupOutlets=[${this.removedPopupOutlets}]` : [])

      .concat(this.addedDialogOutlets.length ? `addedDialogOutlets=[${this.addedDialogOutlets}]` : [])
      .concat(this.removedDialogOutlets.length ? `removedDialogOutlets=[${this.removedDialogOutlets}]` : [])
      .join(', ');
  }
}

interface WorkbenchOutletChanges {
  views: IterableChanges<ViewOutlet> | null;
  hostViews: IterableChanges<HostViewOutlet> | null;
  parts: IterableChanges<PartOutlet> | null;
  hostParts: IterableChanges<HostPartOutlet> | null;
  popups: IterableChanges<PopupOutlet> | null;
  dialogs: IterableChanges<DialogOutlet> | null;
}
