/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding} from '@angular/core';
import {WorkbenchPopup} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {PreferredSizeService} from '@scion/microfrontend-platform';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportModule} from '@scion/components/viewport';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {SciPropertyModule} from '@scion/components.internal/property';
import {AsyncPipe, JsonPipe, NgIf} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';

/**
 * Popup test component which can grow and shrink.
 */
@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrls: ['./popup-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    JsonPipe,
    A11yModule,
    FormsModule,
    NullIfEmptyPipe,
    SciViewportModule,
    SciFormFieldModule,
    SciAccordionModule,
    SciPropertyModule,
    ReactiveFormsModule,
  ],
})
export default class PopupPageComponent {

  public uuid = UUID.randomUUID();

  @HostBinding('style.width')
  public get width(): string {
    return this.form.controls.width.value;
  }

  @HostBinding('style.height')
  public get height(): string {
    return this.form.controls.height.value;
  }

  @HostBinding('style.min-height')
  public get minHeight(): string {
    return this.form.controls.minHeight.value;
  }

  @HostBinding('style.max-height')
  public get maxHeight(): string {
    return this.form.controls.maxHeight.value;
  }

  @HostBinding('style.min-width')
  public get minWidth(): string {
    return this.form.controls.minWidth.value;
  }

  @HostBinding('style.max-width')
  public get maxWidth(): string {
    return this.form.controls.maxWidth.value;
  }

  public form = this._formBuilder.group({
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
    result: this._formBuilder.control(''),
  });

  constructor(host: ElementRef<HTMLElement>,
              private _formBuilder: NonNullableFormBuilder,
              public route: ActivatedRoute,
              public popup: WorkbenchPopup) {
    // Use the size of this component as the popup size.
    Beans.get(PreferredSizeService).fromDimension(host.nativeElement);

    const configuredPopupSize = popup.capability.properties.size;
    this.form.controls.width.setValue(configuredPopupSize?.width ?? 'max-content');
    this.form.controls.height.setValue(configuredPopupSize?.height ?? 'max-content');
  }

  public onClose(): void {
    this.popup.close(this.form.controls.result.value);
  }

  public onCloseWithError(): void {
    this.popup.closeWithError(this.form.controls.result.value);
  }
}
