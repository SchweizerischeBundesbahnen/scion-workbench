/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Intent, IntentClient, mapToBody, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Beans} from '@scion/toolkit/bean-manager';
import {catchError, firstValueFrom, throwError} from 'rxjs';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {Maps} from '@scion/toolkit/util';
import {WorkbenchView} from '../view/workbench-view';
import {WorkbenchDialogService} from './workbench-dialog-service';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchDialogService implements WorkbenchDialogService {

  /** @inheritDoc */
  public open<R>(qualifier: Qualifier, options?: WorkbenchDialogOptions): Promise<R | undefined> {
    const intent: Intent = {type: WorkbenchCapabilities.Dialog, qualifier, params: Maps.coerce(options?.params)};
    const body: WorkbenchDialogOptions = {
      ...options,
      context: {viewId: options?.context?.viewId ?? Beans.opt(WorkbenchView)?.id},
      params: undefined, // passed via intent
    };
    const closeResult$ = Beans.get(IntentClient).request$<R>(intent, body)
      .pipe(
        mapToBody(),
        catchError((error: unknown) => throwError(() => error instanceof RequestError ? error.message : error)),
      );
    return firstValueFrom(closeResult$, {defaultValue: undefined});
  }
}
