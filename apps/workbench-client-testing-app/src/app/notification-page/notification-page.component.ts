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
import {WorkbenchNotification} from '@scion/workbench-client';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from 'workbench-testing-app-common';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss'],
  imports: [
    AsyncPipe,
    JsonPipe,
    FormsModule,
    NullIfEmptyPipe,
    ReactiveFormsModule,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
  ],
})
export default class NotificationPageComponent {

  protected readonly route = inject(ActivatedRoute);
  protected readonly notification = inject(WorkbenchNotification);
  protected readonly focused = toSignal(inject(WorkbenchNotification).focused$, {initialValue: true});

  constructor() {
    this.notification.signalReady();
  }

  protected onClose(): void {
    this.notification.close();
  }
}
