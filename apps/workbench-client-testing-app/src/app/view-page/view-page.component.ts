/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViewClosingEvent, ViewClosingListener, WorkbenchView } from '@scion/workbench-client';
import { ActivatedRoute } from '@angular/router';
import { UUID } from '@scion/toolkit/uuid';
import { Observable, Subject } from 'rxjs';
import { map, scan, startWith, takeUntil } from 'rxjs/operators';

const TITLE = 'title';
const HEADING = 'heading';
const DIRTY = 'dirty';
const CLOSABLE = 'closable';
const CONFIRM_CLOSING = 'confirmClosing';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss'],
})
export class ViewPageComponent implements ViewClosingListener, OnDestroy {

  public readonly TITLE = TITLE;
  public readonly HEADING = HEADING;
  public readonly DIRTY = DIRTY;
  public readonly CLOSABLE = CLOSABLE;
  public readonly CONFIRM_CLOSING = CONFIRM_CLOSING;

  public form: FormGroup;
  public uuid = UUID.randomUUID();
  public activeLog$: Observable<string>;

  private _destroy$ = new Subject<void>();

  constructor(formBuilder: FormBuilder,
              public view: WorkbenchView,
              public route: ActivatedRoute) {
    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [HEADING]: formBuilder.control(''),
      [DIRTY]: formBuilder.control(false),
      [CLOSABLE]: formBuilder.control(true),
      [CONFIRM_CLOSING]: formBuilder.control(false),
    });

    this.activeLog$ = view.active$
      .pipe(
        scan((acc: boolean[], active: boolean) => acc.concat(active), [] as boolean[]),
        map(activeLog => activeLog.join('\n')),
      );

    this.view.title = this.form.get(TITLE).valueChanges;
    this.view.heading = this.form.get(HEADING).valueChanges;
    this.view.dirty = this.form.get(DIRTY).valueChanges;
    this.view.closable = this.form.get(CLOSABLE).valueChanges;

    this.installClosingListener();
  }

  public async onClosing(event: ViewClosingEvent): Promise<void> {
    if (!this.form.get(CONFIRM_CLOSING).value) {
      return;
    }

    if (!confirm('Do you want to close this view?')) {
      event.preventDefault();
    }
  }

  private installClosingListener(): void {
    this.form.get(CONFIRM_CLOSING).valueChanges
      .pipe(
        startWith(this.form.get(CONFIRM_CLOSING).value as boolean),
        takeUntil(this._destroy$),
      )
      .subscribe(confirmClosing => {
        if (confirmClosing) {
          this.view.addClosingListener(this);
        }
        else {
          this.view.removeClosingListener(this);
        }
      });
  }

  public ngOnDestroy(): void {
    this.view.removeClosingListener(this);
    this._destroy$.next();
  }
}
