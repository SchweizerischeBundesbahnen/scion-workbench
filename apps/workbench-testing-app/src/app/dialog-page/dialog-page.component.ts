/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, input} from '@angular/core';
import {WorkbenchDialog, WorkbenchDialogActionDirective} from '@scion/workbench';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {UUID} from '@scion/toolkit/uuid';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-dialog-page',
  templateUrl: './dialog-page.component.html',
  styleUrls: ['./dialog-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciCheckboxComponent,
    WorkbenchDialogActionDirective,
  ],
  host: {
    '[style.height]': 'form.controls.componentSize.controls.height.value',
    '[style.width]': 'form.controls.componentSize.controls.width.value',
  },
})
export class DialogPageComponent {

  public readonly input = input<string>();

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly dialog = inject(WorkbenchDialog);
  protected readonly uuid = UUID.randomUUID();

  protected readonly form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    dialogSize: new FormGroup({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    componentSize: new FormGroup({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
    }),
    behavior: new FormGroup({
      closable: this._formBuilder.control(this.dialog.closable()),
      resizable: this._formBuilder.control(this.dialog.resizable()),
    }),
    styles: new FormGroup({
      padding: this._formBuilder.control(this.dialog.padding()),
    }),
    closeWithError: this._formBuilder.control(false),
    result: this._formBuilder.control(''),
  });

  constructor() {
    this.installPropertyUpdater();
  }

  protected onClose(): void {
    const result = this.form.controls.closeWithError.value ? new Error(this.form.controls.result.value) : this.form.controls.result.value;
    this.dialog.close(result);
  }

  private installPropertyUpdater(): void {
    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(title => this.dialog.title = title);

    this.form.controls.dialogSize.controls.minWidth.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(minWidth => this.dialog.size.minWidth = minWidth || undefined);

    this.form.controls.dialogSize.controls.width.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(width => this.dialog.size.width = width || undefined);

    this.form.controls.dialogSize.controls.maxWidth.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(maxWidth => this.dialog.size.maxWidth = maxWidth || undefined);

    this.form.controls.dialogSize.controls.minHeight.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(minHeight => this.dialog.size.minHeight = minHeight || undefined);

    this.form.controls.dialogSize.controls.height.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(height => this.dialog.size.height = height || undefined);

    this.form.controls.dialogSize.controls.maxHeight.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(maxHeight => {
        this.dialog.size.maxHeight = maxHeight || undefined;
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
