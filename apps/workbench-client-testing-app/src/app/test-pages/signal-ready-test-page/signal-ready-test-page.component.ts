/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Optional} from '@angular/core';
import {WorkbenchDialog, WorkbenchPopup, WorkbenchView} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Component that signals readiness when a message is published to the topic `signal-ready/${viewId}` (view context) or `signal-ready/${popupCapabilityId}` (popup context)
 */
@Component({
  selector: 'app-signal-ready-test-page',
  template: '',
  standalone: true,
})
export default class SignalReadyTestPageComponent {

  constructor(@Optional() view: WorkbenchView, @Optional() popup: WorkbenchPopup, @Optional() dialog: WorkbenchDialog) {
    this.installReadySignaler(view ?? popup ?? dialog);
  }

  private installReadySignaler(handle: WorkbenchView | WorkbenchPopup | WorkbenchDialog | undefined): void {
    if (!handle) {
      return;
    }
    Beans.get(MessageClient).observe$(`signal-ready/${isView(handle) ? handle.id : handle.capability.metadata!.id}`)
      .pipe(takeUntilDestroyed())
      .subscribe(() => handle.signalReady());
  }
}

function isView(handle: WorkbenchView | WorkbenchPopup | WorkbenchDialog): handle is WorkbenchView {
  return (handle as WorkbenchView).id !== undefined;
}
