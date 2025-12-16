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
import {Defined, Maps} from '@scion/toolkit/util';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {catchError, firstValueFrom, throwError} from 'rxjs';
import {eMESSAGE_BOX_MESSAGE_PARAM, ɵWorkbenchMessageBoxCommand} from './workbench-message-box-command';
import {WorkbenchMessageBoxService} from './workbench-message-box-service';
import {Translatable} from '../text/workbench-text-provider.model';
import {DialogId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchMessageBoxService implements WorkbenchMessageBoxService {

  constructor(private _context?: ViewId | PartId | DialogId | PopupId | undefined) {
  }

  /** @inheritDoc */
  public open(message: Translatable | null | Qualifier, options?: WorkbenchMessageBoxOptions): Promise<string> {
    const intent = ((): Intent => {
      if (typeof message === 'string' || message === null) {
        return {type: WorkbenchCapabilities.MessageBox, qualifier: {}, params: new Map().set(eMESSAGE_BOX_MESSAGE_PARAM, message ?? undefined)};
      }
      else {
        return {type: WorkbenchCapabilities.MessageBox, qualifier: message, params: Maps.coerce(options?.params)};
      }
    })();
    const command: ɵWorkbenchMessageBoxCommand = {
      title: options?.title,
      actions: options?.actions,
      severity: options?.severity,
      modality: options?.modality,
      contentSelectable: options?.contentSelectable,
      cssClass: options?.cssClass,
      context: (() => {
        // TODO [Angular 22] Remove backward compatiblity.
        const context = options?.context && (typeof options.context === 'object' ? options.context.viewId : options.context);
        return Defined.orElse(context, this._context);
      })(),
    };

    const action$ = Beans.get(IntentClient).request$<string>(intent, command)
      .pipe(
        mapToBody(),
        catchError((error: unknown) => throwError(() => error instanceof RequestError ? error.message : error)),
      );
    return firstValueFrom(action$);
  }
}
