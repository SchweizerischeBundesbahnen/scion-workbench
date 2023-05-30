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
import {Popup} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';
import {SciViewportModule} from '@scion/components/viewport';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {FormsModule} from '@angular/forms';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {JsonPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrls: ['./popup-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    JsonPipe,
    FormsModule,
    NullIfEmptyPipe,
    SciViewportModule,
    SciFormFieldModule,
    SciAccordionModule,
  ],
})
export class PopupPageComponent {

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

  constructor(public popup: Popup) {
  }

  public onClose(): void {
    this.popup.close(this.result);
  }

  public onCloseWithError(): void {
    this.popup.closeWithError(this.result);
  }
}
