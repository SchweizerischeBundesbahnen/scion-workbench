/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Disposable, Service } from './metadata';
import { MessageBus } from './message-bus-service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UUID } from './uuid.util';
import { Platform } from './platform';
import { ActivityAction, ActivityHostMessageTypes, ActivityProperties, HostMessage, MessageEnvelope } from '@scion/workbench-application-platform.api';

/**
 * Allows interaction with workbench activities.
 *
 * Activities are top-level navigation elements to open activity panels or views.
 * They are placed in the activity bar on the far left-hand side.
 */
export class ActivityService implements Service {

  private _destroy$ = new Subject<void>();
  private _active$ = new ReplaySubject<boolean>(1);
  private _disposables = new Set<Disposable>();

  constructor() {
    Platform.getService(MessageBus).receive$
      .pipe(
        filter((envelope: MessageEnvelope) => envelope.channel === 'host'),
        takeUntil(this._destroy$)
      )
      .subscribe((envelope: MessageEnvelope) => {
        this.onHostMessage(envelope);
      });
  }

  private onHostMessage(envelope: MessageEnvelope<HostMessage>): void {
    switch (envelope.message.type) {
      case ActivityHostMessageTypes.Active: {
        this.handleActiveChange(envelope);
        break;
      }
    }
  }

  /**
   * Sets properties of the activity which is currently showing this application.
   */
  public setProperties(properties: ActivityProperties): void {
    Platform.getService(MessageBus).postMessage({
      channel: 'host',
      message: {type: ActivityHostMessageTypes.PropertiesWrite, payload: properties} as HostMessage
    });
  }

  /**
   * Gets properties of the activity which is currently showing this application.
   */
  public getProperties(): Promise<ActivityProperties> {
    return Platform.getService(MessageBus).requestReply({
      channel: 'host',
      message: {type: ActivityHostMessageTypes.PropertiesRead} as HostMessage,
    }).then(envelope => envelope && envelope.message as ActivityProperties || {}); // envelope is 'undefined' on shutdown
  }

  /**
   * Associates an action with the activity showing this application.
   * The action is displayed in the upper right corner of the activity panel header.
   *
   * Returns {Disposable} to remove the action.
   */
  public addAction(action: ActivityAction): Disposable {
    const actionId = UUID.randomUUID();
    action.metadata = {id: actionId};

    Platform.getService(MessageBus).postMessage({
      channel: 'host',
      message: {type: ActivityHostMessageTypes.ActionAdd, payload: action} as HostMessage
    });

    const disposable = ({
      dispose: (): void => {
        this._disposables.delete(disposable);
        Platform.getService(MessageBus).postMessage({
          channel: 'host',
          message: {type: ActivityHostMessageTypes.ActionRemove, payload: actionId} as HostMessage
        });
      }
    });
    this._disposables.add(disposable);
    return disposable;
  }

  /**
   * Indicates whether this activity is the active activity.
   * Emits the current state upon subscription.
   */
  public get active$(): Observable<boolean> {
    return this._active$.asObservable();
  }

  private handleActiveChange(envelope: MessageEnvelope<HostMessage>): void {
    this._active$.next(envelope.message.payload);
  }

  public onDestroy(): void {
    this._disposables.forEach(action => action.dispose());
    this._disposables.clear();
    this._destroy$.next();
  }
}
