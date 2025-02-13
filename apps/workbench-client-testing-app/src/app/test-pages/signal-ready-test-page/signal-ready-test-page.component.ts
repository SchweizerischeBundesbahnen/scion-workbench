/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchDialog, WorkbenchMessageBox, WorkbenchPopup, WorkbenchView} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Component that signals readiness when a message is published to the topic `signal-ready/${viewId}` (view context) or `signal-ready/${capabilityId}` (popup, dialog or message box context)
 */
@Component({
  selector: 'app-signal-ready-test-page',
  template: '',
  standalone: true,
})
export default class SignalReadyTestPageComponent {

  constructor() {
    const view = inject(WorkbenchView, {optional: true});
    const popup = inject(WorkbenchPopup, {optional: true});
    const dialog = inject(WorkbenchDialog, {optional: true});
    const messageBox = inject(WorkbenchMessageBox, {optional: true});

    this.installReadySignaler(view ?? popup ?? dialog ?? messageBox);
  }

  private installReadySignaler(handle: WorkbenchView | WorkbenchPopup | WorkbenchDialog | WorkbenchMessageBox | null): void {
    if (!handle) {
      return;
    }
    Beans.get(MessageClient).observe$(`signal-ready/${isView(handle) ? handle.id : handle.capability.metadata!.id}`)
      .pipe(takeUntilDestroyed())
      .subscribe(() => handle.signalReady());
  }
}

function isView(handle: WorkbenchView | WorkbenchPopup | WorkbenchDialog | WorkbenchMessageBox): handle is WorkbenchView {
  return !!(handle as Partial<WorkbenchView>).id?.startsWith('view.');
}
