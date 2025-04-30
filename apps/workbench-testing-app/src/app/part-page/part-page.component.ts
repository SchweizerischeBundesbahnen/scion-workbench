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
import {PartId, WorkbenchPart, WorkbenchPartActionDirective} from '@scion/workbench';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';
import {AsyncPipe, DOCUMENT} from '@angular/common';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {JoinPipe} from '../common/join.pipe';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {Arrays} from '@scion/toolkit/util';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {parseTypedString} from '../common/parse-typed-value.util';
import {fromMutation$} from '@scion/toolkit/observable';
import {map, startWith, switchMap} from 'rxjs/operators';
import {animationFrameScheduler, Observable, timer} from 'rxjs';

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
    MultiValueInputComponent,
  ],
})
export default class PartPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    title: this._formBuilder.control<string | '<undefined>'>(''),
    partActions: this._formBuilder.control(''),
    cssClass: this._formBuilder.control(''),
  });
  protected readonly part = inject(WorkbenchPart);
  protected readonly route = inject(ActivatedRoute);
  protected readonly uuid = UUID.randomUUID();
  protected readonly partActions = this.computePartActions();
  protected readonly activationInstant = this.computeActivationInstant();
  protected readonly titleList = `title-list-${UUID.randomUUID()}`;

  constructor() {
    this.installTitleUpdater();
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

  private computeActivationInstant(): Signal<number | null> {
    const document = inject(DOCUMENT);

    return toSignal(timer(0, animationFrameScheduler).pipe(switchMap(() => partActivationInstant$(this.part.id))), {initialValue: null});

    function partActivationInstant$(partId: PartId): Observable<number | null> {
      const partElement = document.querySelector(`wb-part[data-partid="${partId}"]`)!;
      return fromMutation$(partElement, {attributeFilter: ['data-activation-instant'], subtree: false})
        .pipe(
          startWith(null),
          map(() => partElement.getAttribute('data-activation-instant') as number | null),
        );
    }
  }

  private installTitleUpdater(): void {
    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(title => this.part.title = parseTypedString(title)!);
  }

  private installCssClassUpdater(): void {
    this.form.controls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClasses => this.part.cssClass = cssClasses);
  }
}

interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}
