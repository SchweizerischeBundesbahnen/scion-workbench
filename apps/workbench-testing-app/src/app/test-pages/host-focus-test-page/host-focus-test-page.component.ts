/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, signal, Signal} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {FormsModule} from '@angular/forms';
import {WorkbenchDialog, WorkbenchMessageBox, WorkbenchPopup, WorkbenchView} from '@scion/workbench-client';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-host-focus-test-page',
  templateUrl: './host-focus-test-page.component.html',
  styleUrls: ['./host-focus-test-page.component.scss'],
  imports: [SciFormFieldComponent, FormsModule],
})
export default class HostFocusTestPageComponent {

  protected readonly focused: Signal<boolean>;

  constructor() {
    if (inject(WorkbenchView, {optional: true})) {
      this.focused = toSignal(inject(WorkbenchView).focused$, {initialValue: true});
    }
    else if (inject(WorkbenchDialog, {optional: true})) {
      this.focused = toSignal(inject(WorkbenchDialog).focused$, {initialValue: true});
    }
    else if (inject(WorkbenchMessageBox, {optional: true})) {
      this.focused = toSignal(inject(WorkbenchMessageBox).focused$, {initialValue: true});
    }
    else if (inject(WorkbenchPopup, {optional: true})) {
      this.focused = toSignal(inject(WorkbenchPopup).focused$, {initialValue: true});
    }
    else {
      this.focused = signal(false).asReadonly();
    }
  }
}
