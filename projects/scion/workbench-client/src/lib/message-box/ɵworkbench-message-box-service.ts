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
import {WorkbenchMessageBoxOptions} from './workbench-message-box.options';
import {Beans} from '@scion/toolkit/bean-manager';
import {Maps} from '@scion/toolkit/util';
import {WorkbenchView} from '../view/workbench-view';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {catchError, firstValueFrom, throwError} from 'rxjs';
import {eMESSAGE_BOX_MESSAGE_PARAM} from './workbench-message-box-capability';
import {WorkbenchMessageBoxService} from './workbench-message-box-service';

/**
 * @ignore
 * @docs-private Not public API, intended for internal use only.
 */
export class ɵWorkbenchMessageBoxService implements WorkbenchMessageBoxService {

  /** @inheritDoc */
  public open(message: string | Qualifier, options?: WorkbenchMessageBoxOptions): Promise<string> {
    const intent = ((): Intent => {
      if (typeof message === 'string') {
        return {type: WorkbenchCapabilities.MessageBox, qualifier: {}, params: new Map().set(eMESSAGE_BOX_MESSAGE_PARAM, message)};
      }
      else {
        return {type: WorkbenchCapabilities.MessageBox, qualifier: message, params: Maps.coerce(options?.params)};
      }
    })();

    const body: WorkbenchMessageBoxOptions = {
      ...options,
      context: {viewId: options?.context?.viewId ?? Beans.opt(WorkbenchView)?.id},
      params: undefined, // passed via intent
    };

    const action$ = Beans.get(IntentClient).request$<string>(intent, body)
      .pipe(
        mapToBody(),
        catchError(error => throwError(() => error instanceof RequestError ? error.message : error)),
      );
    return firstValueFrom(action$);
  }
}
