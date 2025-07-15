/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DOCUMENT, inject, Signal} from '@angular/core';
import {CanCloseRef, ViewId, WorkbenchMessageBoxService, WorkbenchPartActionDirective, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
import {animationFrameScheduler, EMPTY, Observable, switchMap} from 'rxjs';
import {map, observeOn, startWith} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Arrays} from '@scion/toolkit/util';
import {AsyncPipe} from '@angular/common';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {JoinPipe} from '../common/join.pipe';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import {rootEffect} from '../common/root-effect';
import {fromMutation$} from '@scion/toolkit/observable';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss'],
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    NullIfEmptyPipe,
    JoinPipe,
    AppendParamDataTypePipe,
    WorkbenchPartActionDirective,
    MultiValueInputComponent,
  ],
})
export default class ViewPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    partActions: this._formBuilder.control(''),
    cssClass: this._formBuilder.control(''),
    confirmClosing: this._formBuilder.control(false),
  });

  protected readonly view = inject(WorkbenchView);
  protected readonly route = inject(ActivatedRoute);
  protected readonly uuid = UUID.randomUUID();
  protected readonly partActions: Signal<WorkbenchPartActionDescriptor[]>;
  protected readonly activationInstant: Signal<number | null>;

  constructor() {
    if (!inject(WorkbenchStartup).done()) {
      throw Error('[LifecycleError] Component constructed before the workbench startup completed!'); // Do not remove as required by `startup.e2e-spec.ts` in [#1]
    }

    this.installViewActiveStateLogger();
    this.installCssClassUpdater();
    this.installCanCloseGuard();

    this.partActions = this.computePartActions();
    this.activationInstant = this.computeActivationInstant();
  }

  private async confirmClosing(): Promise<boolean> {
    const action = await inject(WorkbenchMessageBoxService).open('Do you want to close this view?', {
      actions: {yes: 'Yes', no: 'No', error: 'Throw Error'},
      cssClass: ['e2e-close-view', this.view.id],
    });

    if (action === 'error') {
      throw Error(`[CanCloseSpecError] Error in CanLoad of view '${this.view.id}'.`);
    }
    return action === 'yes';
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
    return toSignal(toObservable(this.view.active)
      .pipe(
        observeOn(animationFrameScheduler),
        switchMap(active => active ? viewActivationInstant$(this.view.id) : EMPTY),
      ), {initialValue: null});

    function viewActivationInstant$(viewId: ViewId): Observable<number | null> {
      const viewElement = document.querySelector(`wb-view-slot[data-viewid="${viewId}"]`)!;
      return fromMutation$(viewElement, {attributeFilter: ['data-activation-instant'], subtree: false})
        .pipe(
          startWith(null),
          map(() => viewElement.getAttribute('data-activation-instant') as number | null),
        );
    }
  }

  private installViewActiveStateLogger(): void {
    rootEffect(() => {
      if (this.view.active()) {
        console.debug(`[ViewActivate] [component=ViewPageComponent@${this.uuid}]`);
      }
      else {
        console.debug(`[ViewDeactivate] [component=ViewPageComponent@${this.uuid}]`);
      }
    });
  }

  private installCssClassUpdater(): void {
    this.form.controls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClasses => {
        this.view.cssClass = cssClasses;
      });
  }

  private installCanCloseGuard(): void {
    let canCloseRef: CanCloseRef | undefined;

    this.form.controls.confirmClosing.valueChanges
      .pipe(
        startWith(this.form.controls.confirmClosing.value),
        takeUntilDestroyed(),
      )
      .subscribe(confirmClosing => {
        if (confirmClosing) {
          canCloseRef = this.view.canClose(() => this.confirmClosing());
        }
        else {
          canCloseRef?.dispose();
        }
      });
  }
}

interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}
