/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';
import {LEGACY_NOTIFICATION_INPUT} from './ɵnotification';

/**
 * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
 */
@Pipe({name: 'wbRemoveLegacyInput'})
export class RemoveLegacyInputPipe implements PipeTransform {

  public transform(inputs: {[name: string]: unknown} | undefined): {[name: string]: unknown} | undefined {
    const inputsCopy = {...inputs ?? {}};
    delete inputsCopy[LEGACY_NOTIFICATION_INPUT]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
    return inputsCopy;
  }
}
