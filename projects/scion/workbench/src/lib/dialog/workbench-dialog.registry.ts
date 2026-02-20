/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, Injectable, Signal} from '@angular/core';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog.model';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';
import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';

/**
 * Registry for {@link ɵWorkbenchDialog} elements.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchDialogRegistry extends WorkbenchElementRegistry<DialogId, ɵWorkbenchDialog> {

  constructor() {
    super({
      nullElementErrorFn: dialogId => Error(`[NullDialogError] Dialog '${dialogId}' not found.`),
      onUnregister: dialog => dialog.destroy(),
    });
  }

  /**
   * Gets the position of a dialog in its invocation context.
   */
  public indexOf(dialog: ɵWorkbenchDialog): number {
    const index = this.elements().filter(element => element.invocationContext?.elementId === dialog.invocationContext?.elementId).indexOf(dialog);
    if (index === -1) {
      throw Error('[NullDialogError] Dialog not found');
    }
    return index;
  }

  /**
   * Gets the topmost dialog in the given context, including application modal dialogs overlapping any context.
   *
   * Method must not be called in a reactive context.
   */
  public top(context?: ViewId | PartId | DialogId | PopupId | NotificationId): Signal<ɵWorkbenchDialog | null> {
    assertNotInReactiveContext(this.top, 'Call WorkbenchDialogRegistry.top() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    return computed(() => {
      const top = this.elements()
        .filter(dialog => dialog.modal)
        .filter(dialog => !dialog.invocationContext || dialog.invocationContext.elementId === context)
        .at(-1) ?? null;
      if (!top || top.id === context) {
        return null;
      }

      return top;
    });
  }
}
