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
import {Observable} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {shareReplay} from 'rxjs/operators';
import {decorateObservable} from '../observable-decorator';
import {NotificationId} from '../workbench.identifiers';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {WorkbenchNotification} from './workbench-notification';
import {WorkbenchNotificationCapability, ɵNotificationContext, ɵWorkbenchPopupMessageHeaders} from '@scion/workbench-client';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchNotification implements WorkbenchNotification {

  public readonly id: NotificationId;
  public readonly capability: WorkbenchNotificationCapability;
  public readonly params: Map<string, unknown>;
  public readonly referrer: WorkbenchNotification['referrer'];
  public readonly focused$: Observable<boolean>;

  constructor(private _context: ɵNotificationContext) {
    this.id = this._context.notificationId;
    this.capability = this._context.capability;
    this.params = this._context.params;
    this.referrer = this._context.referrer;
    this.focused$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.notificationFocusedTopic(this.id))
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

  /** @inheritDoc */
  public close(): void {
    void Beans.get(MessageClient).publish(ɵWorkbenchCommands.notificationCloseTopic(this.id));
  }
}
