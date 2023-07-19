/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {MessageBox} from '@scion/workbench';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {UUID} from '@scion/toolkit/uuid';
import {NgIf} from '@angular/common';
import {SciViewportComponent} from '@scion/components/viewport';
import {StringifyPipe} from '../common/stringify.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';

@Component({
  selector: 'app-inspect-message-box',
  templateUrl: './inspect-message-box.component.html',
  styleUrls: ['./inspect-message-box.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    StringifyPipe,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciViewportComponent,
    SciKeyValueFieldComponent,
  ],
})
export class InspectMessageBoxComponent {

  public uuid = UUID.randomUUID();
  public form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    severity: this._formBuilder.control<'info' | 'warn' | 'error' | undefined>(undefined),
    cssClass: this._formBuilder.control(''),
    actions: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    returnValue: this._formBuilder.control(''),
  });

  constructor(public messageBox: MessageBox<Map<string, any>>, private _formBuilder: NonNullableFormBuilder) {
    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(title => {
        this.messageBox.setTitle(title || undefined);
      });

    this.form.controls.severity.valueChanges
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(),
      )
      .subscribe(severity => {
        this.messageBox.setSeverity(severity);
      });

    this.form.controls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClass => {
        this.messageBox.setCssClass(cssClass.split(/\s+/).filter(Boolean));
      });

    this.form.controls.actions.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(actions => {
        this.messageBox.setActions(actions.map(action => ({
            key: action.key!,
            label: action.value!,
            onAction: () => `${action.key} => ${this.form.controls.returnValue.value}`,
          })),
        );
      });
  }
}
