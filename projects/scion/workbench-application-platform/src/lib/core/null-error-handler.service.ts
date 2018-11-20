/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ErrorHandler } from './metadata';
import { Injectable } from '@angular/core';
import { Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Implementation of {ErrorHandler} that does nothing.
 */
@Injectable()
export class NullErrorHandler implements ErrorHandler {

  public handleNotQualifiedCapabilityMessageError(application: string, type: string, qualifier: Qualifier, message: string): void {
  }

  public handleNotQualifiedIntentMessageError(application: string, type: string, qualifier: Qualifier, message: string): void {
  }

  public handleNullProviderError(application: string, type: string, qualifier: Qualifier, message: string): void {
  }
}
