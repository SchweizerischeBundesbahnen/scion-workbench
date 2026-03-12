/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject} from '@angular/core';
import {SciMenuContextProvider} from '@scion/sci-components/menu';
import {WorkbenchDialog, WorkbenchNotification, WorkbenchPart, WorkbenchView} from '@scion/workbench-client';
import {MaybeSignal} from '../common/utility-types';

export class MicrofrontendMenuContextProvider implements SciMenuContextProvider {

  /** @inheritDoc */
  public provideContext(): MaybeSignal<Map<string, unknown>> {
    const view = inject(WorkbenchView, {optional: true});
    if (view) {
      return new Map<string, unknown>().set('viewId', view.id);
    }

    const part = inject(WorkbenchPart, {optional: true});
    if (part) {
      return new Map<string, unknown>().set('partId', part.id);
    }

    const dialog = inject(WorkbenchDialog, {optional: true});
    if (dialog) {
      return new Map<string, unknown>().set('dialogId', dialog.id);
    }

    const notification = inject(WorkbenchNotification, {optional: true});
    if (notification) {
      return new Map<string, unknown>().set('notificationId', notification.id);
    }

    return new Map();
  }

  /** @inheritDoc */
  public provideAcceleratorTarget(): MaybeSignal<Element | undefined> {
    // const view = inject(ɵWorkbenchView, {optional: true});
    // if (view) {
    //   return view.slot.portal.element;
    // }
    //
    // const part = inject(ɵWorkbenchPart, {optional: true});
    // if (part) {
    //   return part.slot.portal.element;
    // }
    //
    // const dialog = inject(ɵWorkbenchDialog, {optional: true});
    // if (dialog) {
    //   return dialog.element;
    // }
    //
    // const notification = inject(ɵWorkbenchNotification, {optional: true});
    // if (notification) {
    //   return notification.portal.element;
    // }

    return undefined;
  }
}

