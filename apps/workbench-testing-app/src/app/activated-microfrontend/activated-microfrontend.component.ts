/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {ActivatedMicrofrontend, WORKBENCH_POPUP_REFERRER, WorkbenchDialog, WorkbenchPopup} from '@scion/workbench';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciViewportComponent} from '@scion/components/viewport';
import {JsonPipe} from '@angular/common';
import {AppendDataTypePipe, NullIfEmptyPipe} from 'workbench-testing-app-common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';

@Component({
  selector: 'app-activated-microfrontend',
  templateUrl: './activated-microfrontend.component.html',
  styleUrl: './activated-microfrontend.component.scss',
  imports: [
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciFormFieldComponent,
    SciViewportComponent,
    JsonPipe,
    NullIfEmptyPipe,
    SciKeyValueComponent,
    AppendDataTypePipe,
  ],
})
export default class ActivatedMicrofrontendComponent {

  protected readonly activatedMicrofrontend = inject(ActivatedMicrofrontend);
  protected readonly activatedMicrofrontendPopupReferrer = inject(WORKBENCH_POPUP_REFERRER, {optional: true});

  constructor() {
    // Set width if a dialog to have enough space to render the capability.
    const dialog = inject(WorkbenchDialog, {optional: true});
    if (dialog && !dialog.size.width()) {
      dialog.size.width = '700px';
    }

    // Set width if a popup to have enough space to render the capability.
    const popup = inject(WorkbenchPopup, {optional: true});
    if (popup && !popup.size.width()) {
      popup.size.width = '700px';
    }
  }
}
