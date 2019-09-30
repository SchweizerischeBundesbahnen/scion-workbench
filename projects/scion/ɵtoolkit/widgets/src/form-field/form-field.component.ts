/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

@Component({
  selector: 'sci-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class SciFormFieldComponent implements OnDestroy {

  private _focusTrap: FocusTrap;

  @Input()
  public label: string;

  constructor(host: ElementRef<HTMLElement>, focusTrapFactory: FocusTrapFactory) {
    this._focusTrap = focusTrapFactory.create(host.nativeElement);
    this._focusTrap.enabled = false;
  }

  public onLabelClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this._focusTrap.enabled = true;
    this._focusTrap.focusFirstTabbableElement();
    this._focusTrap.enabled = false;
  }

  public ngOnDestroy(): void {
    this._focusTrap.destroy();
  }
}
