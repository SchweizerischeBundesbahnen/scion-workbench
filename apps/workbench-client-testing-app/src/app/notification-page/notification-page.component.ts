/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject} from '@angular/core';
import {WorkbenchNotification} from '@scion/workbench-client';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from 'workbench-testing-app-common';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {PreferredSizeService} from '@scion/microfrontend-platform';
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
    SciCheckboxComponent,
  ],
  host: {
    '[style.height]': 'form.controls.componentSize.controls.height.value',
  },
})
export default class NotificationPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly route = inject(ActivatedRoute);
  protected readonly notification = inject(WorkbenchNotification);
  protected readonly focused = toSignal(inject(WorkbenchNotification).focused$, {initialValue: true});

  protected readonly form = this._formBuilder.group({
    componentSize: new FormGroup({
      height: this._formBuilder.control(''),
      reportSize: this._formBuilder.control(true),
    }),
  });

  constructor() {
    this.notification.signalReady();
    this.installPreferredSizeReporter();
  }

  protected onClose(): void {
    this.notification.close();
  }

  /**
   * Reports the size of this component to adapt the workbench notification size.
   */
  private installPreferredSizeReporter(): void {
    const preferredSizeService = inject(PreferredSizeService);
    const host = inject(ElementRef).nativeElement as HTMLElement;

    this.form.controls.componentSize.controls.reportSize.valueChanges
      .pipe(
        startWith(this.form.controls.componentSize.controls.reportSize.value),
        takeUntilDestroyed(),
      )
      .subscribe(reportSize => {
        preferredSizeService.fromDimension(reportSize ? host : undefined);
      });
  }
}
