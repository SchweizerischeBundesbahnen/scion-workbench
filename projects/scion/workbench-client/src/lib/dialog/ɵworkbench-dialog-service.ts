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
import {Defined, Maps} from '@scion/toolkit/util';
import {WorkbenchDialogService} from './workbench-dialog-service';
import {WORKBENCH_ELEMENT, WorkbenchElement} from '../workbench.model';
import {ɵWorkbenchDialogCommand} from './workbench-dialog-command';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchDialogService implements WorkbenchDialogService {

  /** @inheritDoc */
  public open<R>(qualifier: Qualifier, options?: WorkbenchDialogOptions): Promise<R | undefined> {
    const intent: Intent = {type: WorkbenchCapabilities.Dialog, qualifier, params: Maps.coerce(options?.params)};
    const command: ɵWorkbenchDialogCommand = {
      modality: options?.modality,
      animate: options?.animate,
      cssClass: options?.cssClass,
      context: (() => {
        // TODO [Angular 22] Remove backward compatiblity.
        const context = options?.context && (typeof options.context === 'object' ? options.context.viewId : options.context);
        return Defined.orElse(context, () => Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.id);
      })(),
    };

    const closeResult$ = Beans.get(IntentClient).request$<R>(intent, command)
      .pipe(
        mapToBody(),
        catchError((error: unknown) => throwError(() => error instanceof RequestError ? error.message : error)),
      );
    return firstValueFrom(closeResult$, {defaultValue: undefined});
  }
}
