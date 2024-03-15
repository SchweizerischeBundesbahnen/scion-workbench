/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MessageClient, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {ɵDialogContext} from './ɵworkbench-dialog-context';
import {WorkbenchDialog} from './workbench-dialog';
import {Beans} from '@scion/toolkit/bean-manager';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {Observable, Subject} from 'rxjs';
import {Observables} from '@scion/toolkit/util';
import {takeUntil} from 'rxjs/operators';
import {WorkbenchDialogCapability} from './workbench-dialog-capability';

/**
 * @ignore
 * @docs-private Not public API, intended for internal use only.
 */
export class ɵWorkbenchDialog<R = unknown> implements WorkbenchDialog {

  private _destroy$ = new Subject<void>();

  public readonly capability: WorkbenchDialogCapability;
  public readonly params: Map<string, unknown>;

  constructor(private _context: ɵDialogContext) {
    this.capability = this._context.capability;
    this.params = this._context.params;
  }

  /**
   * @inheritDoc
   */
  public setTitle(title: string | Observable<string>): void {
    Observables.coerce(title)
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => Beans.get(MessageClient).publish(ɵWorkbenchCommands.dialogTitleTopic(this._context.dialogId), value).then());
  }

  /**
   * @inheritDoc
   */
  public async close(result?: R | Error): Promise<void> {
    this._destroy$.next();
    if (result instanceof Error) {
      const headers = new Map().set(ɵWorkbenchDialogMessageHeaders.CLOSE_WITH_ERROR, true);
      Beans.get(MessageClient).publish(ɵWorkbenchCommands.dialogCloseTopic(this._context.dialogId), result.message, {headers}).then();
    }
    else {
      Beans.get(MessageClient).publish(ɵWorkbenchCommands.dialogCloseTopic(this._context.dialogId), result).then();
    }
  }

  /**
   * @inheritDoc
   */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }
}

/**
 * Message headers to interact with the workbench dialog.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export enum ɵWorkbenchDialogMessageHeaders {
  CLOSE_WITH_ERROR = 'ɵWORKBENCH-DIALOG:CLOSE_WITH_ERROR',
}
