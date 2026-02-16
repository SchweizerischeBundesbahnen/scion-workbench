/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject} from '@angular/core';
import {WorkbenchMessageBox} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
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
  selector: 'app-message-box-page',
  templateUrl: './message-box-page.component.html',
  styleUrls: ['./message-box-page.component.scss'],
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
    '[style.width]': 'form.controls.componentSize.controls.width.value',
    // This component contains expandable panels that can grow and shrink.
    // If positioned absolutely (out of document flow) it can always be rendered at its preferred size
    // thus allowing it to shrink when an accordion is collapsed.
    '[style.position]': `form.controls.componentSize.controls.positionAbsolute.value ? 'absolute' : 'static'`,
  },
})
export default class MessageBoxPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly route = inject(ActivatedRoute);
  protected readonly messageBox = inject(WorkbenchMessageBox);
  protected readonly uuid = UUID.randomUUID();
  protected readonly focused = toSignal(inject(WorkbenchMessageBox).focused$, {initialValue: true});

  protected readonly form = this._formBuilder.group({
    componentSize: new FormGroup({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      reportSize: this._formBuilder.control(true),
      positionAbsolute: this._formBuilder.control(false),
    }),
  });

  constructor() {
    this.installPreferredSizeReporter();
    this.messageBox.signalReady();
  }

  /**
   * Reports the size of this component to adapt the workbench message box size.
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
