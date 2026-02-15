/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FieldValidationDirective, SciKeyValueFieldComponent} from 'workbench-testing-app-common';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SettingsService} from '../../settings.service';
import {form, Field, hidden, required} from '@angular/forms/signals';
import {Qualifier} from '@scion/microfrontend-platform';
import {RouteRegistrationService} from '../../route-registration.service';

@Component({
  selector: 'app-register-route-page',
  templateUrl: './register-route-page.component.html',
  styleUrls: ['./register-route-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    Field,
    FieldValidationDirective,
  ],
})
export default class RegisterRoutePageComponent {

  private readonly _settingsService = inject(SettingsService);
  private readonly _routeRegistrationService = inject(RouteRegistrationService);
  private readonly _initialFormValue = {
    path: '',
    component: '' as '' | 'part-page' | 'view-page' | 'dialog-page' | 'messagebox-page' | 'popup-page' | 'notification-page' | 'router-page' | 'focus-test-page' | 'size-test-page' | 'text-test-page' | 'notification-param-reducer-test-page' | 'microfrontend-dialog-opener-page' | 'microfrontend-messagebox-opener-page' | 'microfrontend-popup-opener-page',
    data: {} as Record<string, unknown>,
    canMatch: {
      fn: '' as '' | 'canMatchWorkbenchPart' | 'canMatchWorkbenchView' | 'canMatchWorkbenchPartCapability' | 'canMatchWorkbenchViewCapability' | 'canMatchWorkbenchDialogCapability' | 'canMatchWorkbenchMessageBoxCapability' | 'canMatchWorkbenchPopupCapability' | 'canMatchWorkbenchNotificationCapability',
      qualifier: {} as Qualifier,
      hint: '',
    },
  };

  protected readonly form = form(signal(this._initialFormValue), path => {
    required(path.component);
    hidden(path.canMatch.qualifier, ({valueOf}) => !isCanMatchWorkbenchCapabilityFn(valueOf(path.canMatch.fn)));
    hidden(path.canMatch.hint, ({valueOf}) => !isCanMatchWorkbenchElementFn(valueOf(path.canMatch.fn)));
  });

  protected onRegister(): false {
    const formValue = this.form().value();
    this._routeRegistrationService.register({
      path: formValue.path,
      component: formValue.component || undefined!,
      data: formValue.data,
      canMatch: formValue.canMatch.fn ? [{
        fn: formValue.canMatch.fn,
        hint: formValue.canMatch.hint,
        qualifier: formValue.canMatch.qualifier,
      }] : undefined,
    });
    this.resetForm();
    return false;
  }

  public resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form().reset(this._initialFormValue);
    }
  }
}

function isCanMatchWorkbenchElementFn(canMatch: string): boolean {
  return (canMatch.startsWith('canMatchWorkbench') && !canMatch.endsWith('Capability'));
}

function isCanMatchWorkbenchCapabilityFn(canMatch: string): boolean {
  return (canMatch.startsWith('canMatchWorkbench') && canMatch.endsWith('Capability'));
}
