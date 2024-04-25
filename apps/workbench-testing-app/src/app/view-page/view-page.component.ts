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
import {WorkbenchPartActionDirective, WorkbenchRouteData, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Arrays} from '@scion/toolkit/util';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
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
    NgIf,
    NgFor,
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

  public uuid = UUID.randomUUID();
  public partActions$: Observable<WorkbenchPartActionDescriptor[]>;

  public formControls = {
    partActions: this._formBuilder.control(''),
    cssClass: this._formBuilder.control(''),
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
    this.view.active$
      .pipe(takeUntilDestroyed())
      .subscribe(active => {
        if (active) {
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
}

export interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}
