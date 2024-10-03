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
import {WorkbenchDesktop, WorkbenchDialog, WorkbenchMessageBox, WorkbenchPopup, WorkbenchView} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Component that signals readiness when a message is published to the following topic depending on the context:
 * - view: `signal-ready/${viewId}`
 * - popup, dialog or messagebox: `signal-ready/${capabilityId}`
 * - desktop: `signal-ready/desktop`
 */
@Component({
  selector: 'app-signal-ready-test-page',
  template: '',
  standalone: true,
})
export default class SignalReadyTestPageComponent {

  private view = inject(WorkbenchView, {optional: true});
  private popup = inject(WorkbenchPopup, {optional: true});
  private dialog = inject(WorkbenchDialog, {optional: true});
  private messageBox = inject(WorkbenchMessageBox, {optional: true});
  private desktop = inject(WorkbenchDesktop, {optional: true});

  constructor() {
    this.installReadySignaler();
  }

  private installReadySignaler(): void {
    const handle = this.view ?? this.popup ?? this.dialog ?? this.messageBox ?? this.desktop;

    Beans.get(MessageClient).observe$(this.computeTopic())
      .pipe(takeUntilDestroyed())
      .subscribe(() => handle!.signalReady());
  }

  private computeTopic(): string {
    if (this.view) {
      return `signal-ready/${this.view.id}`;
    }
    else if (this.popup || this.dialog || this.messageBox) {
      return `signal-ready/${(this.popup ?? this.dialog ?? this.messageBox)!.capability.metadata!.id}`;
    }
    else if (this.desktop) {
      return 'signal-ready/desktop';
    }
    else {
      throw Error('SignalReadyTestPageComponent not opened in a workbench view, popup, dialog, message box or desktop.');
    }
  }
}


