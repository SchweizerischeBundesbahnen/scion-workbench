/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, inject} from '@angular/core';
import {WorkbenchMessageBox, WorkbenchNotification} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from 'workbench-testing-app-common';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {PreferredSizeService} from '@scion/microfrontend-platform';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {startWith} from 'rxjs/operators';

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
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;

  protected readonly route = inject(ActivatedRoute);
  protected readonly notification = inject(WorkbenchNotification);
  protected readonly focused = toSignal(inject(WorkbenchNotification).focused$, {initialValue: true});

  constructor() {
    this.notification.signalReady();
  }

  protected onClose() {
    this.notification.close();
  }
}
