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
import {WorkbenchRouteData, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
import {merge, Observable, Subject} from 'rxjs';
import {filter, map, startWith, takeUntil} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {UntypedFormControl} from '@angular/forms';
import {Arrays} from '@scion/toolkit/util';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss'],
})
export class ViewPageComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public uuid = UUID.randomUUID();
  public viewpartActions$: Observable<ViewpartAction[]>;
  public viewpartActionsFormControl = new UntypedFormControl('');

  public WorkbenchRouteData = WorkbenchRouteData;

  constructor(public view: WorkbenchView,
              public route: ActivatedRoute,
              workbenchStartup: WorkbenchStartup) {
    if (!workbenchStartup.isStarted()) {
      throw Error('[LifecycleError] Component constructed before the workbench startup completed!'); // Do not remove as required by `startup.e2e-spec.ts` in [#1]
    }

    this.applyConfiguredViewTitle();
    this.applyConfiguredViewHeading();

    this.viewpartActions$ = this.viewpartActionsFormControl.valueChanges
      .pipe(
        map(() => this.parseViewpartActions()),
        startWith(this.parseViewpartActions()),
      );

    this.installViewActiveStateLogger();
    this.installNavigationalStateLogger();
  }

  /**
   * Sets the title either from the route's data or matrix param.
   */
  private applyConfiguredViewTitle(): void {
    merge(this.route.data, this.route.params)
      .pipe(
        map(params => params['title']),
        filter<string>(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe(title => {
        this.view.title = title;
      });
  }

  /**
   * Sets the heading either from the route's data or matrix param.
   */
  private applyConfiguredViewHeading(): void {
    merge(this.route.data, this.route.params)
      .pipe(
        map(params => params['heading']),
        filter<string>(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe(heading => {
        this.view.heading = heading;
      });
  }

  private parseViewpartActions(): ViewpartAction[] {
    if (!this.viewpartActionsFormControl.value) {
      return [];
    }

    try {
      return Arrays.coerce(JSON.parse(this.viewpartActionsFormControl.value));
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
        console.debug(`[ActivatedRouteDataChange] [viewId=${this.view.viewId}, state=${JSON.stringify(data[WorkbenchRouteData.state])}]`);
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

export interface ViewpartAction {
  icon: string;
  align: 'start' | 'end';
  cssClass: string;
}
