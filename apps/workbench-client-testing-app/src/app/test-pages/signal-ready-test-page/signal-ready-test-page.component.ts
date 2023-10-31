/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Optional} from '@angular/core';
import {WorkbenchPopup, WorkbenchView} from '@scion/workbench-client';
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

  constructor(@Optional() view: WorkbenchView, @Optional() popup: WorkbenchPopup) {
    this.installViewReadySignaler(view);
    this.installPopupReadySignaler(popup);
  }

  private installViewReadySignaler(view: WorkbenchView | undefined): void {
    if (!view) {
      return;
    }
    Beans.get(MessageClient).observe$(`signal-ready/${view.id}`)
      .pipe(takeUntilDestroyed())
      .subscribe(() => view.signalReady());
  }

  private installPopupReadySignaler(popup: WorkbenchPopup | undefined): void {
    if (!popup) {
      return;
    }
    Beans.get(MessageClient).observe$(`signal-ready/${popup.capability.metadata!.id}`)
      .pipe(takeUntilDestroyed())
      .subscribe(() => popup.signalReady());
  }
}
