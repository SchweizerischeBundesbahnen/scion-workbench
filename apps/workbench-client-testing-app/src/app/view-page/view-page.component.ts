/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Component, Inject, OnDestroy} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ViewClosingEvent, ViewClosingListener, WorkbenchMessageBoxService, WorkbenchRouter, WorkbenchView} from '@scion/workbench-client';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {EMPTY, MonoTypeOperatorFunction, Subject} from 'rxjs';
import {finalize, mergeMapTo, startWith, take, takeUntil} from 'rxjs/operators';
import {APP_INSTANCE_ID} from '../app-instance-id';
import {SciParamsEnterComponent} from '@scion/toolkit.internal/widgets';
import {Location} from '@angular/common';

const TITLE = 'title';
const HEADING = 'heading';
const CLOSABLE = 'closable';
const CONFIRM_CLOSING = 'confirmClosing';
const SELF_NAVIGATION = 'selfNavigation';
const PARAMS = 'params';
const PARAMS_HANDLING = 'paramsHandling';
const NAVIGATE_PER_PARAM = 'navigatePerParam';

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
  public readonly SELF_NAVIGATION = SELF_NAVIGATION;
  public readonly PARAMS = PARAMS;
  public readonly PARAMS_HANDLING = PARAMS_HANDLING;
  public readonly NAVIGATE_PER_PARAM = NAVIGATE_PER_PARAM;

  public form: FormGroup;
  public uuid = UUID.randomUUID();

  private _destroy$ = new Subject<void>();

  constructor(formBuilder: FormBuilder,
              public view: WorkbenchView,
              public route: ActivatedRoute,
              @Inject(APP_INSTANCE_ID) public appInstanceId: string,
              private _router: WorkbenchRouter,
              public location: Location,
              private _messageBoxService: WorkbenchMessageBoxService) {
    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [HEADING]: formBuilder.control(''),
      [CLOSABLE]: formBuilder.control(true),
      [CONFIRM_CLOSING]: formBuilder.control(false),
      [SELF_NAVIGATION]: formBuilder.group({
        [PARAMS]: formBuilder.array([]),
        [PARAMS_HANDLING]: formBuilder.control(''),
        [NAVIGATE_PER_PARAM]: formBuilder.control(false),
      }),
    });

    this.view.setTitle(this.form.get(TITLE).valueChanges.pipe(this.logCompletion('TitleObservableComplete')));
    this.view.setHeading(this.form.get(HEADING).valueChanges.pipe(this.logCompletion('HeadingObservableComplete')));
    this.view.markDirty(new Subject<void>().pipe(mergeMapTo(EMPTY), this.logCompletion('DirtyObservableComplete')));
    this.view.setClosable(this.form.get(CLOSABLE).valueChanges.pipe(this.logCompletion('ClosableObservableComplete')));

    this.installClosingListener();
    this.installViewActiveStateLogger();
    this.installObservableCompletionLogger();
    this.setInitialTitleFromParams();

    this.view.capability$
      .pipe(
        take(1),
        takeUntil(this._destroy$),
      )
      .subscribe(capability => {
        console.debug(`[ViewCapability$::first] [component=ViewPageComponent@${this.uuid}, capabilityId=${capability.metadata.id}]`);
      });
  }

  public async onClosing(event: ViewClosingEvent): Promise<void> {
    if (!this.form.get(CONFIRM_CLOSING).value) {
      return;
    }

    const action = await this._messageBoxService.open({
      content: 'Do you want to close this view?',
      severity: 'info',
      actions: {
        yes: 'Yes',
        no: 'No',
      },
      cssClass: 'close-view',
    });

    if (action === 'no') {
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

  public onSelfNavigate(): void {
    const selfNavigationGroup = this.form.get(SELF_NAVIGATION);
    const params = SciParamsEnterComponent.toParamsDictionary(selfNavigationGroup.get(PARAMS) as FormArray, false);
    const paramsHandling = selfNavigationGroup.get(PARAMS_HANDLING).value;

    // Replace `<undefined>` with `undefined`, and `<null>` with `null`.
    Object.entries(params).forEach(([paramName, paramValue]) => {
      if ('<undefined>' === paramValue) {
        params[paramName] = undefined;
      }
      else if ('<null>' === paramValue) {
        params[paramName] = null;
      }
    });

    if (selfNavigationGroup.get(NAVIGATE_PER_PARAM).value) {
      Object.entries(params).forEach(([paramName, paramValue]) => {
        this._router.navigate({}, {params: {[paramName]: paramValue}, paramsHandling: paramsHandling || undefined}).then();
      });
    }
    else {
      this._router.navigate({}, {params, paramsHandling: paramsHandling || undefined}).then();
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

  /**
   * Sets the view's initial title if contained in its params.
   */
  private setInitialTitleFromParams(): void {
    const params = this.view.snapshot.params;
    if (params.has('initialTitle')) {
      this.view.setTitle(params.get('initialTitle'));
      // Restore title observer
      this.view.setTitle(this.form.get(TITLE).valueChanges);
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
      console.debug(`[${logPrefix}] [component=ViewPageComponent@${this.uuid}]`);
    });
  }

  public ngOnDestroy(): void {
    this.view.removeClosingListener(this);
    this._destroy$.next();
  }
}
