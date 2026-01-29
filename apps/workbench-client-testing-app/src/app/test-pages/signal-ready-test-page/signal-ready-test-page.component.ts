/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchDialog, WorkbenchMessageBox, WorkbenchNotification, WorkbenchPart, WorkbenchPopup, WorkbenchView} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Component that signals readiness when a message is published to the topic `signal-ready/<id>`.
 *
 * Use view or part id for views and parts. Use capability id for other workbench elements.
 */
@Component({
  selector: 'app-signal-ready-test-page',
  template: '',
})
export default class SignalReadyTestPageComponent {

  constructor() {
    const view = inject(WorkbenchView, {optional: true});
    const part = inject(WorkbenchPart, {optional: true});
    const popup = inject(WorkbenchPopup, {optional: true});
    const dialog = inject(WorkbenchDialog, {optional: true});
    const messageBox = inject(WorkbenchMessageBox, {optional: true});
    const notification = inject(WorkbenchNotification, {optional: true});

    this.installReadySignaler(view ?? part ?? popup ?? dialog ?? messageBox ?? notification);
  }

  private installReadySignaler(handle: WorkbenchView | WorkbenchPart | WorkbenchPopup | WorkbenchDialog | WorkbenchMessageBox | WorkbenchNotification | null): void {
    if (!handle) {
      return;
    }
    Beans.get(MessageClient).observe$(`signal-ready/${isView(handle) || isPart(handle) ? handle.id : handle.capability.metadata!.id}`)
      .pipe(takeUntilDestroyed())
      .subscribe(() => handle.signalReady());
  }
}

function isView(handle: WorkbenchView | WorkbenchPart | WorkbenchPopup | WorkbenchDialog | WorkbenchMessageBox | WorkbenchNotification): handle is WorkbenchView {
  return !!(handle as Partial<WorkbenchView>).id?.startsWith('view.');
}

function isPart(handle: WorkbenchView | WorkbenchPart | WorkbenchPopup | WorkbenchDialog | WorkbenchMessageBox | WorkbenchNotification): handle is WorkbenchPart {
  return !!(handle as Partial<WorkbenchPart>).id?.startsWith('part.');
}
