/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {mapToBody, MessageClient, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {fromEvent, Observable, Subject} from 'rxjs';
import {Beans, PreDestroy} from '@scion/toolkit/bean-manager';
import {filter, shareReplay, takeUntil} from 'rxjs/operators';
import {decorateObservable} from '../observable-decorator';
import {NotificationId} from '../workbench.identifiers';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {WorkbenchNotification} from './workbench-notification.model';
import {ɵNotificationContext} from './ɵworkbench-notification-context';
import {WorkbenchNotificationCapability} from './workbench-notification-capability';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchNotification implements WorkbenchNotification, PreDestroy {

  public readonly id: NotificationId;
  public readonly capability: WorkbenchNotificationCapability;
  public readonly params: Map<string, unknown>;
  public readonly referrer: WorkbenchNotification['referrer'];
  public readonly focused$: Observable<boolean>;

  private readonly _destroy$ = new Subject<void>();

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

    this.closeOnAuxiliaryMouseButton();
  }

  /** @inheritDoc */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }

  /** @inheritDoc */
  public close(): void {
    void Beans.get(MessageClient).publish(ɵWorkbenchCommands.notificationCloseTopic(this.id));
  }

  /**
   * Closes the notification when clicking the auxiliary mouse button.
   */
  private closeOnAuxiliaryMouseButton(): void {
    fromEvent<MouseEvent>(document.documentElement, 'auxclick')
      .pipe(
        filter(event => event.button === 1), // primary aux button
        takeUntil(this._destroy$),
      )
      .subscribe(event => {
        event.preventDefault(); // prevent user-agent default action
        this.close();
      });
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}
