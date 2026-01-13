/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, input} from '@angular/core';
import {ActivatedMicrofrontend, Popup, WorkbenchPopup} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {PopupSizeDirective} from '../popup-opener-page/popup-size.directive';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import ActivatedMicrofrontendComponent from '../activated-microfrontend/activated-microfrontend.component';

@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrl: './popup-page.component.scss',
  imports: [
    FormsModule,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    ReactiveFormsModule,
    SciCheckboxComponent,
    ActivatedMicrofrontendComponent,
  ],
  host: {
    '[style.height]': 'form.controls.componentSize.controls.height.value',
    '[style.width]': 'form.controls.componentSize.controls.width.value',
    '[style.min-height]': 'form.controls.componentSize.controls.minHeight.value',
    '[style.max-height]': 'form.controls.componentSize.controls.maxHeight.value',
    '[style.min-width]': 'form.controls.componentSize.controls.minWidth.value',
    '[style.max-width]': 'form.controls.componentSize.controls.maxWidth.value',
  },
  hostDirectives: [{directive: PopupSizeDirective, inputs: ['size']}],
})
export default class PopupPageComponent {

  public readonly input = input<string>();

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly popup = inject(WorkbenchPopup);
  protected readonly legacyPopup = inject(Popup);
  protected readonly activatedMicrofrontend = inject(ActivatedMicrofrontend, {optional: true});
  protected readonly uuid = UUID.randomUUID();

  protected readonly form = this._formBuilder.group({
    componentSize: this._formBuilder.group({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    popupSize: this._formBuilder.group({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    closeWithError: this._formBuilder.control(false),
    result: this._formBuilder.control(''),
  });

  constructor() {
    this.bindPopupSize();
  }

  protected onApplyReturnValue(): void {
    this.popup.setResult(this.form.controls.result.value);
  }

  protected onClose(): void {
    const result = this.form.controls.closeWithError.value ? new Error(this.form.controls.result.value) : this.form.controls.result.value;
    this.popup.close(result);
  }

  /**
   * Synchronizes the popup size with values from the UI.
   */
  private bindPopupSize(): void {
    this.form.controls.popupSize.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.popup.size.width = this.form.controls.popupSize.controls.width.value || undefined;
        this.popup.size.height = this.form.controls.popupSize.controls.height.value || undefined;
        this.popup.size.minWidth = this.form.controls.popupSize.controls.minWidth.value || undefined;
        this.popup.size.maxWidth = this.form.controls.popupSize.controls.maxWidth.value || undefined;
        this.popup.size.minHeight = this.form.controls.popupSize.controls.minHeight.value || undefined;
        this.popup.size.maxHeight = this.form.controls.popupSize.controls.maxHeight.value || undefined;
      });
  }
}
