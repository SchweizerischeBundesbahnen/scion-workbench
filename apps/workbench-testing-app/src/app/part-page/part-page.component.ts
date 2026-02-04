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
import {ActivatedMicrofrontend, Translatable, WorkbenchPart, WorkbenchPartActionDirective} from '@scion/workbench';
import {AppendDataTypePipe, MultiValueInputComponent, NullIfEmptyPipe, parseTypedString} from 'workbench-testing-app-common';
import {AsyncPipe} from '@angular/common';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {JoinPipe} from '../common/join.pipe';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {Arrays} from '@scion/toolkit/util';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import ActivatedMicrofrontendComponent from '../activated-microfrontend/activated-microfrontend.component';

@Component({
  selector: 'app-part-page',
  templateUrl: './part-page.component.html',
  styleUrl: './part-page.component.scss',
  imports: [
    AppendDataTypePipe,
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
    ActivatedMicrofrontendComponent,
  ],
})
export default class PartPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly part = inject(WorkbenchPart);
  protected readonly activatedMicrofrontend = inject(ActivatedMicrofrontend, {optional: true});
  protected readonly route = inject(ActivatedRoute);
  protected readonly uuid = UUID.randomUUID();
  protected readonly partActions: Signal<WorkbenchPartActionDescriptor[]>;
  protected readonly titleList = `title-list-${UUID.randomUUID()}`;
  protected readonly badgeList = `badge-list-${UUID.randomUUID()}`;
  protected readonly form = this._formBuilder.group({
    partActions: this._formBuilder.control(''),
    cssClass: this._formBuilder.control(''),
  });

  constructor() {
    this.partActions = this.computePartActions();
    this.installCssClassUpdater();
  }

  protected onPartTitleChange(title: Translatable): void {
    this.part.title = parseTypedString(title)!;
  }

  protected onPartBadgeChange(badge: string): void {
    this.part.badge.set(parseTypedString(badge)!);
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
      .subscribe(cssClasses => this.part.cssClass = cssClasses);
  }
}

interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}
