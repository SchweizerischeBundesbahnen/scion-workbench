/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy } from '@angular/core';
import { provideWorkbenchPopup, WorkbenchPopup, WorkbenchRouter } from '@scion/workbench-application.angular';
import { ActivatedRoute, Params } from '@angular/router';
import { Capability, ManifestRegistryService, NotificationService, PlatformCapabilityTypes, PopupService, Qualifier } from '@scion/workbench-application.core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { PARAM_NAME, PARAM_VALUE, SciParamsEnterComponent } from '@scion/app/common';

const QUALIFIER = 'qualifier';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';

@Component({
  selector: 'app-outlet-capability-exec-popup',
  templateUrl: './outlet-capability-exec-popup.component.html',
  styleUrls: ['./outlet-capability-exec-popup.component.scss'],
  providers: [
    provideWorkbenchPopup(OutletCapabilityExecPopupComponent),
  ],
})
export class OutletCapabilityExecPopupComponent implements OnDestroy {

  public readonly QUALIFIER = QUALIFIER;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly MATRIX_PARAMS = MATRIX_PARAMS;

  public capability: Capability;
  public form: FormGroup;
  public valid: boolean;

  private _destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute,
              manifestRegistryService: ManifestRegistryService,
              notificationService: NotificationService,
              formBuilder: FormBuilder,
              private _popup: WorkbenchPopup,
              private _focusTrapFactory: FocusTrapFactory,
              private _workbenchRouter: WorkbenchRouter,
              private _popupService: PopupService) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([]),
      [QUERY_PARAMS]: formBuilder.array([]),
      [MATRIX_PARAMS]: formBuilder.array([]),
    });

    route.params
      .pipe(
        map(params => params['id']),
        distinctUntilChanged(),
        switchMap(capabilityId => manifestRegistryService.capability$(capabilityId)),
        tap(manifest => !manifest && notificationService.notify({
          severity: 'error',
          title: 'Capability not found',
          text: `No capability found with given id '${route.snapshot.params['id']}'`,
        })),
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe(capability => {
        this.capability = capability;
        this.createQualifierFormControls(capability.qualifier, formBuilder);
        this.requestFocus();
      });
  }

  private createQualifierFormControls(qualifier: Qualifier, formBuilder: FormBuilder): void {
    const formArray = formBuilder.array([]);
    Object.entries(qualifier).forEach(([key, value]) => {
      const readonly = (value !== '*');
      formArray.push(formBuilder.group({
        [PARAM_NAME]: formBuilder.control({value: key, disabled: true}),
        [PARAM_VALUE]: formBuilder.control({value: (readonly ? value : ''), disabled: readonly}, Validators.required),
      }));
    });
    this.form.setControl(QUALIFIER, formArray);
  }

  private requestFocus(): void {
    const focusTrap = this._focusTrapFactory.create(document.body);
    focusTrap.focusInitialElementWhenReady().finally(() => focusTrap.destroy());
  }

  public onExecute(): void {
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray);
    const queryParams: Params = SciParamsEnterComponent.toParams(this.form.get(QUERY_PARAMS) as FormArray);
    const matrixParams: Params = SciParamsEnterComponent.toParams(this.form.get(MATRIX_PARAMS) as FormArray);

    switch (this.capability.type) {
      case PlatformCapabilityTypes.View: {
        this._workbenchRouter.navigate(qualifier, {
          target: 'blank',
          matrixParams,
          queryParams,
        });
        break;
      }
      case PlatformCapabilityTypes.Popup: {
        this._popupService.open({
          position: 'east',
          anchor: event.target as Element,
          queryParams: queryParams,
          matrixParams: matrixParams,
        }, qualifier);
        break;
      }
      default: {
        throw Error(`[CapabilityNotHandledError] Capability type not handled [type=${this.capability.type}]`);
      }
    }

    this._popup.close();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
