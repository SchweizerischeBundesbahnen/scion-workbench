/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Inject, OnDestroy} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {CanClose, WorkbenchMessageBoxService, WorkbenchRouter, WorkbenchView} from '@scion/workbench-client';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {MonoTypeOperatorFunction, NEVER} from 'rxjs';
import {finalize, startWith, take} from 'rxjs/operators';
import {APP_INSTANCE_ID} from '../app-instance-id';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {AsyncPipe, JsonPipe, Location, NgIf} from '@angular/common';
import {parseTypedObject} from '../common/parse-typed-value.util';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {AppendParamDataTypePipe} from '../common/append-param-data-type.pipe';
import {SciViewportComponent} from '@scion/components/viewport';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    JsonPipe,
    ReactiveFormsModule,
    AppendParamDataTypePipe,
    NullIfEmptyPipe,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
    SciViewportComponent,
  ],
})
export default class ViewPageComponent implements CanClose, OnDestroy {

  public form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    heading: this._formBuilder.control(''),
    closable: this._formBuilder.control(true),
    confirmClosing: this._formBuilder.control(false),
    selfNavigation: this._formBuilder.group({
      params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      paramsHandling: this._formBuilder.control<'merge' | 'replace' | ''>(''),
      navigatePerParam: this._formBuilder.control(false),
    }),
  });
  public uuid = UUID.randomUUID();

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _router: WorkbenchRouter,
              private _messageBoxService: WorkbenchMessageBoxService,
              public view: WorkbenchView,
              public route: ActivatedRoute,
              public location: Location,
              @Inject(APP_INSTANCE_ID) public appInstanceId: string) {
    this.view.setTitle(this.form.controls.title.valueChanges.pipe(this.logCompletion('TitleObservableComplete')));
    this.view.setHeading(this.form.controls.heading.valueChanges.pipe(this.logCompletion('HeadingObservableComplete')));
    this.view.markDirty(NEVER.pipe(this.logCompletion('DirtyObservableComplete')));
    this.view.setClosable(this.form.controls.closable.valueChanges.pipe(this.logCompletion('ClosableObservableComplete')));

    this.installClosingListener();
    this.installViewActiveStateLogger();
    this.installObservableCompletionLogger();
    this.setInitialTitleFromParams();
    this.view.signalReady();

    this.view.capability$
      .pipe(
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe(capability => {
        console.debug(`[ViewCapability$::first] [component=ViewPageComponent@${this.uuid}, capabilityId=${capability.metadata!.id}]`);
      });
  }

  public async canClose(): Promise<boolean> {
    if (!this.form.controls.confirmClosing.value) {
      return true;
    }

    const action = await this._messageBoxService.open('Do you want to close this view?', {
      actions: {yes: 'Yes', no: 'No', error: 'Throw Error'},
      cssClass: ['e2e-close-view', this.view.id],
      modality: 'application',
    });

    if (action === 'error') {
      throw Error(`[CanCloseSpecError] Error in CanLoad of view '${this.view.id}'.`);
    }
    return action === 'yes';
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
    const selfNavigationGroup = this.form.controls.selfNavigation;
    const params = parseTypedObject(SciKeyValueFieldComponent.toDictionary(selfNavigationGroup.controls.params, false))!;
    const paramsHandling = selfNavigationGroup.controls.paramsHandling.value;

    if (selfNavigationGroup.controls.navigatePerParam.value) {
      Object.entries(params).forEach(([paramName, paramValue]) => {
        this._router.navigate({}, {params: {[paramName]: paramValue}, paramsHandling: paramsHandling || undefined}).then();
      });
    }
    else {
      this._router.navigate({}, {params, paramsHandling: paramsHandling || undefined}).then();
    }
  }

  private installClosingListener(): void {
    this.form.controls.confirmClosing.valueChanges
      .pipe(
        startWith(this.form.controls.confirmClosing.value),
        takeUntilDestroyed(),
      )
      .subscribe(confirmClosing => {
        if (confirmClosing) {
          this.view.addCanClose(this);
        }
        else {
          this.view.removeCanClose(this);
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
      this.view.setTitle(this.form.controls.title.valueChanges);
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
    this.view.removeCanClose(this);
  }
}
