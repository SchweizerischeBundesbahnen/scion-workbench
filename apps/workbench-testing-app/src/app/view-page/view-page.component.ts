/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, OnDestroy} from '@angular/core';
import {WorkbenchModule, WorkbenchRouteData, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
import {Observable, Subject} from 'rxjs';
import {map, startWith, takeUntil} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {FormsModule, ReactiveFormsModule, UntypedFormControl} from '@angular/forms';
import {Arrays} from '@scion/toolkit/util';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {PluckPipe} from '../common/pluck.pipe';
import {SciPropertyModule} from '@scion/components.internal/property';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {JoinPipe} from '../common/join.pipe';

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
    WorkbenchModule,
    SciFormFieldModule,
    SciCheckboxModule,
    SciAccordionModule,
    SciPropertyModule,
    PluckPipe,
    PluckPipe,
    NullIfEmptyPipe,
    JoinPipe,
  ],
})
export default class ViewPageComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public uuid = UUID.randomUUID();
  public partActions$: Observable<PartAction[]>;
  public partActionsFormControl = new UntypedFormControl('');

  public WorkbenchRouteData = WorkbenchRouteData;

  constructor(public view: WorkbenchView,
              public route: ActivatedRoute,
              workbenchStartup: WorkbenchStartup) {
    if (!workbenchStartup.isStarted()) {
      throw Error('[LifecycleError] Component constructed before the workbench startup completed!'); // Do not remove as required by `startup.e2e-spec.ts` in [#1]
    }

    this.partActions$ = this.partActionsFormControl.valueChanges
      .pipe(
        map(() => this.parsePartActions()),
        startWith(this.parsePartActions()),
      );

    this.installViewActiveStateLogger();
    this.installNavigationalStateLogger();

    // Some tests need to pass CSS classes as matrix parameters because CSS classes passed via the router are not preserved on page reload or browser back/forward navigation.
    view.cssClass = view.cssClasses.concat(route.snapshot.paramMap.get('cssClass') ?? []);
  }

  private parsePartActions(): PartAction[] {
    if (!this.partActionsFormControl.value) {
      return [];
    }

    try {
      return Arrays.coerce(JSON.parse(this.partActionsFormControl.value));
    }
    catch {
      return [];
    }
  }

  private installViewActiveStateLogger(): void {
    this.view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => {
        if (active) {
          console.debug(`[ViewActivate] [component=ViewPageComponent@${this.uuid}]`);
        }
        else {
          console.debug(`[ViewDeactivate] [component=ViewPageComponent@${this.uuid}]`);
        }
      });
  }

  private installNavigationalStateLogger(): void {
    this.route.data
      .pipe(takeUntil(this._destroy$))
      .subscribe(data => {
        console.debug(`[ActivatedRouteDataChange] [viewId=${this.view.id}, state=${JSON.stringify(data[WorkbenchRouteData.state])}]`);
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

export interface PartAction {
  icon: string;
  align: 'start' | 'end';
  cssClass: string;
}
