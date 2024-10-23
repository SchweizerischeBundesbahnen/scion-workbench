/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {PopupService} from '@scion/workbench';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {FormsModule} from '@angular/forms';
import BlankTestPageComponent from '../blank-test-page/blank-test-page.component';

@Component({
  selector: 'app-popup-position-test-page',
  templateUrl: './popup-position-test-page.component.html',
  styleUrl: './popup-position-test-page.component.scss',
  standalone: true,
  imports: [
    SciFormFieldComponent,
    FormsModule,
  ],
})
export default class PopupPositionTestPageComponent {

  protected margin = {
    top: signal(0),
    right: signal(0),
    bottom: signal(0),
    left: signal(0),
  };

  private _popupService = inject(PopupService);
  private _openButton = viewChild.required<ElementRef<HTMLButtonElement>>('open_button');

  public onOpen(): void {
    this._popupService.open<string>({
      component: BlankTestPageComponent,
      anchor: this._openButton()!,
    }).then();
  }
}
