/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Signal} from '@angular/core';
import {WorkbenchPart, WorkbenchPartActionDirective} from '@scion/workbench';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';
import {AsyncPipe} from '@angular/common';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {JoinPipe} from '../common/join.pipe';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {Arrays} from '@scion/toolkit/util';
import {CssClassComponent} from '../css-class/css-class.component';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-part-page',
  templateUrl: './part-page.component.html',
  styleUrl: './part-page.component.scss',
  imports: [
    AppendParamDataTypePipe,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    JoinPipe,
    NullIfEmptyPipe,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciFormFieldComponent,
    SciKeyValueComponent,
    WorkbenchPartActionDirective,
    CssClassComponent,
  ],
})
export default class PartPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly part = inject(WorkbenchPart);
  protected readonly route = inject(ActivatedRoute);
  protected readonly uuid = UUID.randomUUID();
  protected readonly partActions: Signal<WorkbenchPartActionDescriptor[]>;
  protected readonly form = this._formBuilder.group({
    partActions: this._formBuilder.control(''),
    cssClass: this._formBuilder.control(''),
  });

  constructor() {
    this.partActions = this.computePartActions();
    this.installCssClassUpdater();
  }

  private computePartActions(): Signal<WorkbenchPartActionDescriptor[]> {
    const partActions = toSignal(this.form.controls.partActions.valueChanges, {initialValue: this.form.controls.partActions.value});
    return computed(() => {
      try {
        return Arrays.coerce(JSON.parse(partActions() || '[]') as WorkbenchPartActionDescriptor[]);
      }
      catch {
        return [];
      }
    });
  }

  private installCssClassUpdater(): void {
    this.form.controls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClasses => {
        this.part.cssClass = cssClasses;
      });
  }
}

interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}
