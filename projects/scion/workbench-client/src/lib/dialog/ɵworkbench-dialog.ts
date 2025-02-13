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
import {merge, Observable, Subject} from 'rxjs';
import {Observables} from '@scion/toolkit/util';
import {takeUntil} from 'rxjs/operators';
import {WorkbenchDialogCapability} from './workbench-dialog-capability';

/**
 * @ignore
 * @docs-private Not public API, intended for internal use only.
 */
export class ɵWorkbenchDialog<R = unknown> implements WorkbenchDialog {

  private _destroy$ = new Subject<void>();
  private _titleChange$ = new Subject<void>();

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
    this._titleChange$.next();

    Observables.coerce(title)
      .pipe(takeUntil(merge(this._destroy$, this._titleChange$)))
      .subscribe(value => void Beans.get(MessageClient).publish(ɵWorkbenchCommands.dialogTitleTopic(this._context.dialogId), value));
  }

  /**
   * @inheritDoc
   */
  public close(result?: R | Error): void {
    this._destroy$.next();
    if (result instanceof Error) {
      const headers = new Map().set(ɵWorkbenchDialogMessageHeaders.CLOSE_WITH_ERROR, true);
      void Beans.get(MessageClient).publish(ɵWorkbenchCommands.dialogCloseTopic(this._context.dialogId), result.message, {headers});
    }
    else {
      void Beans.get(MessageClient).publish(ɵWorkbenchCommands.dialogCloseTopic(this._context.dialogId), result);
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
