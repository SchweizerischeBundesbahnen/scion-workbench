/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {mapToBody, MessageClient, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {ɵDialogContext} from './ɵworkbench-dialog-context';
import {WorkbenchDialog} from './workbench-dialog.model';
import {Beans} from '@scion/toolkit/bean-manager';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {Observable, Subject} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
import {WorkbenchDialogCapability} from './workbench-dialog-capability';
import {decorateObservable} from '../observable-decorator';
import {DialogId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchDialog implements WorkbenchDialog {

  private _destroy$ = new Subject<void>();

  public readonly id: DialogId;
  public readonly capability: WorkbenchDialogCapability;
  public readonly params: Map<string, unknown>;
  public readonly focused$: Observable<boolean>;

  constructor(private _context: ɵDialogContext) {
    this.id = this._context.dialogId;
    this.capability = this._context.capability;
    this.params = this._context.params;
    this.focused$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.dialogFocusedTopic(this.id))
      .pipe(
        mapToBody(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
      );
  }

  /**
   * @inheritDoc
   */
  public setTitle(title: Translatable): void {
    void Beans.get(MessageClient).publish(ɵWorkbenchCommands.dialogTitleTopic(this._context.dialogId), title);
  }

  /**
   * @inheritDoc
   */
  public close<R>(result?: R | Error): void {
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
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export enum ɵWorkbenchDialogMessageHeaders {
  CLOSE_WITH_ERROR = 'ɵWORKBENCH-DIALOG:CLOSE_WITH_ERROR',
}
