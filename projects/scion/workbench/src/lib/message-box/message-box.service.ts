/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, InjectionToken, NgZone, Optional, SkipSelf } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Action, MessageBox, ɵMessageBox } from './message-box';

/**
 * DI injection token to inject the {MessageBoxService} with application modality context.
 */
export const APP_MESSAGE_BOX_SERVICE = new InjectionToken<MessageBoxService>('APP_MESSAGE_BOX_SERVICE');

/**
 * Displays message boxes to the user.
 */
@Injectable()
export class MessageBoxService {

  private _count$ = new BehaviorSubject<number>(0);

  private _open$ = new Subject<ɵMessageBox>();

  constructor(@Optional() @SkipSelf() @Inject(APP_MESSAGE_BOX_SERVICE) private _globalMessageBoxService: MessageBoxService,
              private _zone: NgZone) {
  }

  /**
   * Displays the specified message to the user.
   *
   * Returns a promise that resolves to the action key which the user pressed to confirm the message.
   *
   * Example usage:
   *
   *  messageBoxService.open({
   *      content: 'Do you want to continue?',
   *      severity: 'info',
   *      actions: {
   *        yes: 'Yes',
   *        no: 'No',
   *        cancel: 'Cancel'
   *      }
   * })
   * .then((action: Action) => {
   *   ...
   * });
   */
  public open(messageBox: MessageBox | string): Promise<Action> {
    // Ensure to run in Angular zone to display the message box even if called from outside of the Angular zone, e.g. from error handler
    return this._zone.run(() => this.openInternal(messageBox));
  }

  private openInternal(messageBox: MessageBox | string): Promise<Action> {
    const msgBox: ɵMessageBox = ((): ɵMessageBox => {
      if (typeof messageBox === 'string') {
        return new ɵMessageBox({content: messageBox});
      }
      else {
        return new ɵMessageBox(messageBox);
      }
    })();

    if (msgBox.modality === 'application' && this._globalMessageBoxService) {
      return this._globalMessageBoxService.open(msgBox);
    }

    this._count$.next(this._count$.value + 1);
    this._open$.next(msgBox);

    return msgBox.close$.toPromise().then((action: Action) => {
      this._count$.next(this._count$.value - 1);
      return action;
    });
  }

  /**
   * Allows to subscribe for message boxes.
   *
   * @internal
   */
  public get open$(): Observable<ɵMessageBox> {
    return this._open$;
  }

  /**
   * Returns the number of displayed message boxes.
   *
   * @internal
   */
  public get count(): number {
    return this._count$.getValue();
  }

  /**
   * Emits the number of displayed message boxes.
   *
   * Upon subscription, the current count is emitted, and then emits continuously
   * when a message box is opened or closed. It never completes.
   *
   * @internal
   */
  public get count$(): Observable<number> {
    return this._count$;
  }
}
