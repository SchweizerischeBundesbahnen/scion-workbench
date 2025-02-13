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
import {DialogOutlet, MessageBoxOutlet, PartOutlet, PopupOutlet, ViewOutlet} from '../workbench.constants';

/**
 * Stateful differ to compute added and removed outlets.
 *
 * Use this differ to register/unregister auxiliary routes for added/removed outlets.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchOutletDiffer {

  private readonly _viewsDiffer = inject(IterableDiffers).find([]).create<ViewOutlet>();
  private readonly _partsDiffer = inject(IterableDiffers).find([]).create<PartOutlet>();
  private readonly _popupsDiffer = inject(IterableDiffers).find([]).create<PopupOutlet>();
  private readonly _dialogsDiffer = inject(IterableDiffers).find([]).create<DialogOutlet>();
  private readonly _messageBoxDiffer = inject(IterableDiffers).find([]).create<MessageBoxOutlet>();

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

    const popupOutlets = Routing.parseOutlets(urlTree, {popup: true}).keys();
    const dialogOutlets = Routing.parseOutlets(urlTree, {dialog: true}).keys();
    const messageBoxOutlets = Routing.parseOutlets(urlTree, {messagebox: true}).keys();

    return new WorkbenchOutletDiff({
      views: this._viewsDiffer.diff(viewOutlets),
      parts: this._partsDiffer.diff(partOutlets),
      popups: this._popupsDiffer.diff(popupOutlets),
      dialogs: this._dialogsDiffer.diff(dialogOutlets),
      messageBoxes: this._messageBoxDiffer.diff(messageBoxOutlets),
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

  public readonly addedPopupOutlets = new Array<PopupOutlet>();
  public readonly removedPopupOutlets = new Array<PopupOutlet>();

  public readonly addedDialogOutlets = new Array<DialogOutlet>();
  public readonly removedDialogOutlets = new Array<DialogOutlet>();

  public readonly addedMessageBoxOutlets = new Array<MessageBoxOutlet>();
  public readonly removedMessageBoxOutlets = new Array<MessageBoxOutlet>();

  constructor(changes: WorkbenchOutletChanges) {
    changes.views?.forEachAddedItem(({item}) => this.addedViewOutlets.push(item));
    changes.views?.forEachRemovedItem(({item}) => this.removedViewOutlets.push(item));

    changes.parts?.forEachAddedItem(({item}) => this.addedPartOutlets.push(item));
    changes.parts?.forEachRemovedItem(({item}) => this.removedPartOutlets.push(item));

    changes.popups?.forEachAddedItem(({item}) => this.addedPopupOutlets.push(item));
    changes.popups?.forEachRemovedItem(({item}) => this.removedPopupOutlets.push(item));

    changes.dialogs?.forEachAddedItem(({item}) => this.addedDialogOutlets.push(item));
    changes.dialogs?.forEachRemovedItem(({item}) => this.removedDialogOutlets.push(item));

    changes.messageBoxes?.forEachAddedItem(({item}) => this.addedMessageBoxOutlets.push(item));
    changes.messageBoxes?.forEachRemovedItem(({item}) => this.removedMessageBoxOutlets.push(item));
  }

  public toString(): string {
    return new Array<string>()
      .concat(this.addedViewOutlets.length ? `addedViewOutlets=[${this.addedViewOutlets}]` : [])
      .concat(this.removedViewOutlets.length ? `removedViewOutlets=[${this.removedViewOutlets}]` : [])

      .concat(this.addedPartOutlets.length ? `addedPartOutlets=[${this.addedPartOutlets}]` : [])
      .concat(this.removedPartOutlets.length ? `removedPartOutlets=[${this.removedPartOutlets}]` : [])

      .concat(this.addedPopupOutlets.length ? `addedPopupOutlets=[${this.addedPopupOutlets}]` : [])
      .concat(this.removedPopupOutlets.length ? `removedPopupOutlets=[${this.removedPopupOutlets}]` : [])

      .concat(this.addedDialogOutlets.length ? `addedDialogOutlets=[${this.addedDialogOutlets}]` : [])
      .concat(this.removedDialogOutlets.length ? `removedDialogOutlets=[${this.removedDialogOutlets}]` : [])

      .concat(this.addedMessageBoxOutlets.length ? `addedMessageBoxOutlets=[${this.addedMessageBoxOutlets}]` : [])
      .concat(this.removedMessageBoxOutlets.length ? `removedMessageBoxOutlets=[${this.removedMessageBoxOutlets}]` : [])
      .join(', ');
  }
}

interface WorkbenchOutletChanges {
  views: IterableChanges<ViewOutlet> | null;
  parts: IterableChanges<PartOutlet> | null;
  popups: IterableChanges<PopupOutlet> | null;
  dialogs: IterableChanges<DialogOutlet> | null;
  messageBoxes: IterableChanges<MessageBoxOutlet> | null;
}
