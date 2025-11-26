/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject} from '@angular/core';
import {WorkbenchPopup} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {PreferredSizeService} from '@scion/microfrontend-platform';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {toSignal} from '@angular/core/rxjs-interop';

/**
 * Popup test component which can grow and shrink.
 */
@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrls: ['./popup-page.component.scss'],
  imports: [
    AsyncPipe,
    JsonPipe,
    CdkTrapFocus,
    FormsModule,
    NullIfEmptyPipe,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    ReactiveFormsModule,
    SciCheckboxComponent,
  ],
  host: {
    '[style.height]': 'form.controls.componentSize.controls.height.value',
    '[style.width]': 'form.controls.componentSize.controls.width.value',
    '[style.min-height]': 'form.controls.componentSize.controls.minHeight.value',
    '[style.max-height]': 'form.controls.componentSize.controls.maxHeight.value',
    '[style.min-width]': 'form.controls.componentSize.controls.minWidth.value',
    '[style.max-width]': 'form.controls.componentSize.controls.maxWidth.value',
  },
})
export default class PopupPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly route = inject(ActivatedRoute);
  protected readonly popup = inject(WorkbenchPopup);
  protected readonly uuid = UUID.randomUUID();
  protected readonly focused = toSignal(inject(WorkbenchPopup).focused$, {initialValue: true});

  protected readonly form = this._formBuilder.group({
    componentSize: this._formBuilder.group({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      // Since the component is positioned absolutely, we set its 'minWidth' to '100vw'
      // so that it can fill the available space horizontally if the popup overlay defines
      // a fixed width.
      minWidth: this._formBuilder.control('100vw'),
      maxWidth: this._formBuilder.control(''),
    }),
    closeWithError: this._formBuilder.control(false),
    result: this._formBuilder.control(''),
  });

  constructor() {
    // Use the size of this component as the popup size.
    const host = inject(ElementRef).nativeElement as HTMLElement;
    Beans.get(PreferredSizeService).fromDimension(host);

    const configuredPopupSize = this.popup.capability.properties.size;
    this.form.controls.componentSize.controls.width.setValue(configuredPopupSize?.width ?? 'max-content');
    this.form.controls.componentSize.controls.height.setValue(configuredPopupSize?.height ?? 'max-content');
    this.popup.signalReady();
  }

  protected onApplyReturnValue(): void {
    this.popup.setResult(this.form.controls.result.value);
  }

  protected onClose(): void {
    const result = this.form.controls.closeWithError.value ? new Error(this.form.controls.result.value) : this.form.controls.result.value;
    this.popup.close(result);
  }
}
