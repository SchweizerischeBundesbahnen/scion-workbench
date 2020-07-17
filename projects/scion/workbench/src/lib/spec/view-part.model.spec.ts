/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Observable, Subject } from 'rxjs';
import { WbBeforeDestroy, WorkbenchView } from '../workbench.model';
import { Component, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Component({})
export abstract class AbstractSpecViewComponent implements OnDestroy, WbBeforeDestroy {

  private _destroy$ = new Subject<void>();

  public destroyed: boolean;
  public activated: boolean;
  public dirty: boolean;
  public checked: boolean;
  public preventDestroy = false;

  constructor(public view: WorkbenchView) {
    view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => this.activated = active);
  }

  public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    return !this.preventDestroy;
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    this._destroy$.next();
  }

  public checkFromTemplate(): boolean {
    this.checked = true;
    return this.checked;
  }
}

@Component({selector: 'spec-view-1', template: 'View 1 {{checkFromTemplate()}}'})
export class SpecView1Component extends AbstractSpecViewComponent {
  constructor(view: WorkbenchView) {
    super(view);
  }
}

@Component({selector: 'spec-view-2', template: 'View 2 {{checkFromTemplate()}}'})
export class SpecView2Component extends AbstractSpecViewComponent {
  constructor(view: WorkbenchView) {
    super(view);
  }
}
