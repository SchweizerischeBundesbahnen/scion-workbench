/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {WorkbenchPopup} from '@scion/workbench-client';
import {AsyncPipe, JsonPipe, NgIf} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {FormsModule} from '@angular/forms';
import {SciViewportModule} from '@scion/components/viewport';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {SciPropertyModule} from '@scion/components.internal/property';

/**
 * Popup component provided by the host app via a popup capability.
 */
@Component({
  selector: 'app-host-popup-page',
  templateUrl: './host-popup-page.component.html',
  styleUrls: ['./host-popup-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    AsyncPipe,
    JsonPipe,
    A11yModule,
    NullIfEmptyPipe,
    SciViewportModule,
    SciFormFieldModule,
    SciAccordionModule,
    SciPropertyModule,
  ],
})
export default class HostPopupPageComponent {

  public uuid = UUID.randomUUID();

  @HostBinding('style.min-height')
  public minHeight: string;

  @HostBinding('style.height')
  public height: string;

  @HostBinding('style.max-height')
  public maxHeight: string;

  @HostBinding('style.min-width')
  public minWidth: string;

  @HostBinding('style.width')
  public width: string;

  @HostBinding('style.max-width')
  public maxWidth: string;

  public result: string;

  constructor(public route: ActivatedRoute,
              public popup: WorkbenchPopup) {
  }

  public onClose(): void {
    this.popup.close(this.result);
  }

  public onCloseWithError(): void {
    this.popup.closeWithError(this.result);
  }
}
