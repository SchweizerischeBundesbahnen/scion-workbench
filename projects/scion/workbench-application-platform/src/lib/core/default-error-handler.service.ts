/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ErrorHandler } from './metadata';
import { Qualifier } from '@scion/workbench-application-platform.api';
import { Injectable } from '@angular/core';
import { NotificationService } from '@scion/workbench';

/**
 * Default implementation of {ErrorHandler} which shows error messages as notifications to the user.
 */
@Injectable()
export class DefaultErrorHandler implements ErrorHandler {

  constructor(private _notificationService: NotificationService) {
  }

  public handleNotQualifiedCapabilityMessageError(application: string, type: string, qualifier: Qualifier, message: string): void {
    this._notificationService.notify({title: `${application} not qualified to perform the requested operation`, content: message, severity: 'error', cssClass: 'e2e-not-qualified'});
  }

  public handleNotQualifiedIntentMessageError(application: string, type: string, qualifier: Qualifier, message: string): void {
    this._notificationService.notify({title: `${application} not qualified to perform the requested operation`, content: message, severity: 'error', cssClass: 'e2e-not-qualified'});
  }

  public handleNullProviderError(application: string, type: string, qualifier: Qualifier, message: string): void {
    this._notificationService.notify({title: `${application} requested an operation which is not available`, content: message, severity: 'error', cssClass: 'e2e-not-handled'});
  }
}
