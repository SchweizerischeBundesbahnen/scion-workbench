/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Inject, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ViewClosingEvent, ViewClosingListener, WorkbenchRouter, WorkbenchView } from '@scion/workbench-client';
import { ActivatedRoute } from '@angular/router';
import { UUID } from '@scion/toolkit/uuid';
import { EMPTY, MonoTypeOperatorFunction, Subject } from 'rxjs';
import { finalize, mergeMapTo, startWith, take, takeUntil } from 'rxjs/operators';
import { APP_INSTANCE_ID } from '../app-instance-id';
import { SciParamsEnterComponent } from '@scion/toolkit.internal/widgets';

const TITLE = 'title';
const HEADING = 'heading';
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
  public readonly CLOSABLE = CLOSABLE;
  public readonly CONFIRM_CLOSING = CONFIRM_CLOSING;

  public form: FormGroup;
  public uuid = UUID.randomUUID();

  public viewParamsControl: FormArray;

  private _destroy$ = new Subject<void>();

  constructor(formBuilder: FormBuilder,
              public view: WorkbenchView,
              public route: ActivatedRoute,
              @Inject(APP_INSTANCE_ID) public appInstanceId: string,
              private _router: WorkbenchRouter) {
    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [HEADING]: formBuilder.control(''),
      [CLOSABLE]: formBuilder.control(true),
      [CONFIRM_CLOSING]: formBuilder.control(false),
    });
    this.viewParamsControl = formBuilder.array([]);

    this.view.setTitle(this.form.get(TITLE).valueChanges.pipe(this.logCompletion('TitleObservableComplete')));
    this.view.setHeading(this.form.get(HEADING).valueChanges.pipe(this.logCompletion('HeadingObservableComplete')));
    this.view.markDirty(new Subject<void>().pipe(mergeMapTo(EMPTY), this.logCompletion('DirtyObservableComplete')));
    this.view.setClosable(this.form.get(CLOSABLE).valueChanges.pipe(this.logCompletion('ClosableObservableComplete')));

    this.installClosingListener();
    this.installViewActiveStateLogger();
    this.installObservableCompletionLogger();
    this.setInitialTitleFromParams();
  }

  public async onClosing(event: ViewClosingEvent): Promise<void> {
    if (!this.form.get(CONFIRM_CLOSING).value) {
      return;
    }

    if (!confirm('Do you want to close this view?')) {
      event.preventDefault();
    }
  }

  public onMarkDirty(dirty?: boolean): void {
    if (dirty === undefined) {
      this.view.markDirty();
    }
    else {
      this.view.markDirty(dirty);
    }
  }

  public onUpdateViewParams(): void {
    const params = SciParamsEnterComponent.toParamsDictionary(this.viewParamsControl);
    this.viewParamsControl.clear();
    this._router.navigate({}, {params}).then();
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

  /**
   * Sets the view's initial title if contained in its params.
   */
  private setInitialTitleFromParams(): void {
    this.view.params$
      .pipe(
        take(1),
        takeUntil(this._destroy$),
      )
      .subscribe(params => {
        if (params.has('initialTitle')) {
          this.view.setTitle(params.get('initialTitle'));
          // Restore title observer
          this.view.setTitle(this.form.get(TITLE).valueChanges);
        }
      });
  }

  private installViewActiveStateLogger(): void {
    this.view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => {
        if (active) {
          console.debug(`[ViewActivate] [component=ViewPageComponent@${this.uuid}]`); // tslint:disable-line:no-console
        }
        else {
          console.debug(`[ViewDeactivate] [component=ViewPageComponent@${this.uuid}]`); // tslint:disable-line:no-console
        }
      });
  }

  private installObservableCompletionLogger(): void {
    // Do not install `takeUntil` operator as it would complete the Observable as well.
    this.view.params$
      .pipe(this.logCompletion('ParamsObservableComplete'))
      .subscribe();
    this.view.capability$
      .pipe(this.logCompletion('CapabilityObservableComplete'))
      .subscribe();
    this.view.active$
      .pipe(this.logCompletion('ActiveObservableComplete'))
      .subscribe();
  }

  private logCompletion<T>(logPrefix: string): MonoTypeOperatorFunction<T> {
    return finalize(() => {
      console.debug(`[${logPrefix}] [component=ViewPageComponent@${this.uuid}]`); // tslint:disable-line:no-console
    });
  }

  public ngOnDestroy(): void {
    this.view.removeClosingListener(this);
    this._destroy$.next();
  }
}
