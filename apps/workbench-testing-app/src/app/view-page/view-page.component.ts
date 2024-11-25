/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, inject} from '@angular/core';
import {CanCloseFn, WorkbenchMessageBoxService, WorkbenchPartActionDirective, WorkbenchRouteData, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Arrays} from '@scion/toolkit/util';
import {AsyncPipe, NgClass} from '@angular/common';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {JoinPipe} from '../common/join.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';
import {CssClassComponent} from '../css-class/css-class.component';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss'],
  standalone: true,
  imports: [
    NgClass,
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
    CssClassComponent,
    WorkbenchPartActionDirective,
  ],
})
export default class ViewPageComponent {

  private _messageBoxService = inject(WorkbenchMessageBoxService);

  public uuid = UUID.randomUUID();
  public partActions$: Observable<WorkbenchPartActionDescriptor[]>;
  public canClose: CanCloseFn | undefined;

  public formControls = {
    partActions: this._formBuilder.control(''),
    cssClass: this._formBuilder.control(''),
    confirmClosing: this._formBuilder.control(false),
  };

  public WorkbenchRouteData = WorkbenchRouteData;

  constructor(private _formBuilder: NonNullableFormBuilder,
              public view: WorkbenchView,
              public route: ActivatedRoute,
              workbenchStartup: WorkbenchStartup) {
    if (!workbenchStartup.isStarted()) {
      throw Error('[LifecycleError] Component constructed before the workbench startup completed!'); // Do not remove as required by `startup.e2e-spec.ts` in [#1]
    }

    this.partActions$ = this.formControls.partActions.valueChanges
      .pipe(
        map(() => this.parsePartActions()),
        startWith(this.parsePartActions()),
      );

    this.installViewActiveStateLogger();
    this.installCssClassUpdater();
    this.installCanCloseGuard();
  }

  private async askToClose(): Promise<boolean> {
    const action = await this._messageBoxService.open('Do you want to close this view?', {
      actions: {yes: 'Yes', no: 'No', error: 'Throw Error'},
      cssClass: ['e2e-close-view', this.view.id],
    });

    if (action === 'error') {
      throw Error(`[CanCloseSpecError] Error in CanLoad of view '${this.view.id}'.`);
    }
    return action === 'yes';
  }

  private parsePartActions(): WorkbenchPartActionDescriptor[] {
    if (!this.formControls.partActions.value) {
      return [];
    }

    try {
      return Arrays.coerce(JSON.parse(this.formControls.partActions.value));
    }
    catch {
      return [];
    }
  }

  private installViewActiveStateLogger(): void {
    effect(() => {
      if (this.view.active()) {
        console.debug(`[ViewActivate] [component=ViewPageComponent@${this.uuid}]`);
      }
      else {
        console.debug(`[ViewDeactivate] [component=ViewPageComponent@${this.uuid}]`);
      }
    });
  }

  private installCssClassUpdater(): void {
    this.formControls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClasses => {
        this.view.cssClass = cssClasses;
      });
  }

  /**
   * Installs {@link CanClose} guard only if checked confirm closing.
   */
  private installCanCloseGuard(): void {
    this.formControls.confirmClosing.valueChanges
      .pipe(
        startWith(this.formControls.confirmClosing.value),
        takeUntilDestroyed(),
      )
      .subscribe(confirmClosing => {
        if (confirmClosing) {
          this.canClose = this.askToClose;
        }
        else {
          delete this.canClose;
        }
      });
  }
}

export interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}
