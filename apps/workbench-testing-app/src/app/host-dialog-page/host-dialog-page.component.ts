/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, OnInit, ViewChild} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Dialog test component with fixed size provided by the workbench host application.
 */
@Component({
  selector: 'app-host-dialog-page',
  templateUrl: './host-dialog-page.component.html',
  styleUrls: ['./host-dialog-page.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    FormsModule,
    NullIfEmptyPipe,
    ReactiveFormsModule,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    SciCheckboxComponent,
  ],
})
export default class HostDialogPageComponent implements OnInit {

  @HostBinding('style.width')
  public get width(): string {
    return this.form.controls.width.value;
  }

  @HostBinding('style.height')
  public get height(): string {
    return this.form.controls.height.value;
  }

  @ViewChild('title_input', {static: true})
  private titleInput!: ElementRef<HTMLElement>;

  public uuid = UUID.randomUUID();

  public form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    height: this._formBuilder.control(''),
    width: this._formBuilder.control(''),
    closeWithError: this._formBuilder.control(false),
    result: this._formBuilder.control(''),
  });

  constructor(private _formBuilder: NonNullableFormBuilder,
              public route: ActivatedRoute,
              public dialog: WorkbenchDialog<string>) {

    dialog.signalReady();

    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(title => this.dialog.setTitle(title));
  }

  public ngOnInit(): void {
    this.titleInput.nativeElement.focus();
  }

  public onClose(): void {
    const result = this.form.controls.closeWithError.value ? new Error(this.form.controls.result.value) : this.form.controls.result.value;
    this.dialog.close(result);
  }
}
