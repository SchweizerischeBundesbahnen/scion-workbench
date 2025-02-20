/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench-client';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-dialog-properties-test-page',
  templateUrl: './dialog-properties-test-page.component.html',
  styleUrl: './dialog-properties-test-page.component.scss',
  imports: [
    SciFormFieldComponent,
  ],
})
export default class DialogPropertiesTestPageComponent {

  private _titleObservable1$ = new Subject<string>();
  private _titleObservable2$ = new Subject<string>();

  constructor(private _dialog: WorkbenchDialog) {
  }

  protected onTitleObservable1Install(): void {
    this._dialog.setTitle(this._titleObservable1$);
  }

  protected onTitleObservable1Emit(title: string): void {
    this._titleObservable1$.next(title);
  }

  protected onTitleObservable2Install(): void {
    this._dialog.setTitle(this._titleObservable2$);
  }

  protected onTitleObservable2Emit(title: string): void {
    this._titleObservable2$.next(title);
  }
}
