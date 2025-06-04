/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, inject} from '@angular/core';
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
})
export default class PopupPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly route = inject(ActivatedRoute);
  protected readonly popup = inject(WorkbenchPopup);
  protected readonly uuid = UUID.randomUUID();

  protected readonly form = this._formBuilder.group({
    minHeight: this._formBuilder.control(''),
    height: this._formBuilder.control(''),
    maxHeight: this._formBuilder.control(''),
    /**
     * Since the component is positioned absolutely, we set its 'minWidth' to '100vw'
     * so that it can fill the available space horizontally if the popup overlay defines
     * a fixed width.
     */
    minWidth: this._formBuilder.control('100vw'),
    width: this._formBuilder.control(''),
    maxWidth: this._formBuilder.control(''),
    closeWithError: this._formBuilder.control(false),
    result: this._formBuilder.control(''),
  });

  @HostBinding('style.width')
  protected get width(): string {
    return this.form.controls.width.value;
  }

  @HostBinding('style.height')
  protected get height(): string {
    return this.form.controls.height.value;
  }

  @HostBinding('style.min-height')
  protected get minHeight(): string {
    return this.form.controls.minHeight.value;
  }

  @HostBinding('style.max-height')
  protected get maxHeight(): string {
    return this.form.controls.maxHeight.value;
  }

  @HostBinding('style.min-width')
  protected get minWidth(): string {
    return this.form.controls.minWidth.value;
  }

  @HostBinding('style.max-width')
  protected get maxWidth(): string {
    return this.form.controls.maxWidth.value;
  }

  constructor() {
    // Use the size of this component as the popup size.
    const host = inject(ElementRef).nativeElement as HTMLElement;
    Beans.get(PreferredSizeService).fromDimension(host);

    const configuredPopupSize = this.popup.capability.properties.size;
    this.form.controls.width.setValue(configuredPopupSize?.width ?? 'max-content');
    this.form.controls.height.setValue(configuredPopupSize?.height ?? 'max-content');
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
