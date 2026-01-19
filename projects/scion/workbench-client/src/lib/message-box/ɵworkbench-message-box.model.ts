/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {mapToBody, MessageClient, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {ɵMessageBoxContext} from './ɵworkbench-message-box-context';
import {WorkbenchMessageBox} from './workbench-message-box.model';
import {WorkbenchMessageBoxCapability} from '../message-box/workbench-message-box-capability';
import {Observable} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {shareReplay} from 'rxjs/operators';
import {decorateObservable} from '../observable-decorator';
import {DialogId} from '../workbench.identifiers';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchMessageBox implements WorkbenchMessageBox {

  public readonly id: DialogId;
  public readonly capability: WorkbenchMessageBoxCapability;
  public readonly params: Map<string, unknown>;
  public readonly referrer: WorkbenchMessageBox['referrer'];
  public readonly focused$: Observable<boolean>;

  constructor(private _context: ɵMessageBoxContext) {
    this.id = this._context.dialogId;
    this.capability = this._context.capability;
    this.params = this._context.params;
    this.referrer = this._context.referrer;
    this.focused$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.dialogFocusedTopic(this.id))
      .pipe(
        mapToBody(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
      );
  }

  /** @inheritDoc */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }
}
