/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Input} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {UUID} from '@scion/toolkit/uuid';
import {NgIf} from '@angular/common';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-dialog-page',
  templateUrl: './dialog-page.component.html',
  styleUrls: ['./dialog-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciCheckboxComponent,
  ],
})
export class DialogPageComponent {

  public uuid = UUID.randomUUID();
  public form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    size: new FormGroup({
      minHeight: this._formBuilder.control(''),
      height: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    behavior: new FormGroup({
      closable: this._formBuilder.control(this.dialog.closable),
      resizable: this._formBuilder.control(this.dialog.resizable),
    }),
    styles: new FormGroup({
      padding: this._formBuilder.control(''),
    }),
    result: this._formBuilder.control(''),
  });

  @Input()
  public input: string | undefined;

  constructor(public dialog: WorkbenchDialog<string>, private _formBuilder: NonNullableFormBuilder) {
    this.installPropertyUpdater();
  }

  public onClose(): void {
    this.dialog.close(this.form.controls.result.value);
  }

  public onCloseWithError(): void {
    this.dialog.closeWithError(this.form.controls.result.value);
  }

  private installPropertyUpdater(): void {
    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(title => this.dialog.title = title);

    this.form.controls.size.controls.minWidth.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(minWidth => this.dialog.size.minWidth = minWidth);

    this.form.controls.size.controls.width.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(width => this.dialog.size.width = width);

    this.form.controls.size.controls.maxWidth.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(maxWidth => this.dialog.size.maxWidth = maxWidth);

    this.form.controls.size.controls.minHeight.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(minHeight => this.dialog.size.minHeight = minHeight);

    this.form.controls.size.controls.height.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(height => this.dialog.size.height = height);

    this.form.controls.size.controls.maxHeight.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(maxHeight => {
        this.dialog.size.maxHeight = maxHeight;
      });

    this.form.controls.behavior.controls.closable.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(closable => this.dialog.closable = closable);

    this.form.controls.behavior.controls.resizable.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(resizable => this.dialog.resizable = resizable);

    this.form.controls.styles.controls.padding.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(padding => this.dialog.padding = padding);
  }
}
