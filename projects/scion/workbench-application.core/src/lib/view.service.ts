/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Service } from './metadata';
import { MessageBus } from './message-bus.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Platform } from './platform';
import { HostMessage, MessageEnvelope, ViewHostMessageTypes, ViewProperties } from '@scion/workbench-application-platform.api';

/**
 * Allows interaction with workbench views.
 *
 * A view is a visual component within the Workbench to present content,
 * and which can be arranged in a view grid.
 */
export class ViewService implements Service {

  private _destroy$ = new Subject<void>();
  private _active$ = new ReplaySubject<boolean>(1);
  private _destroyNotifier: DestroyNotifier;

  constructor() {
    Platform.getService(MessageBus).receive$
      .pipe(
        filter((envelope: MessageEnvelope) => envelope.channel === 'host'),
        takeUntil(this._destroy$),
      )
      .subscribe((envelope: MessageEnvelope) => {
        this.onHostMessage(envelope);
      });
  }

  private onHostMessage(envelope: MessageEnvelope<HostMessage>): void {
    switch (envelope.message.type) {
      case ViewHostMessageTypes.Active: {
        this.handleActiveChange(envelope);
        break;
      }
      case ViewHostMessageTypes.BeforeDestroy: {
        this.handleBeforeDestroy(envelope);
        break;
      }
    }
  }

  /**
   * Sets properties of the view which is currently showing this application.
   */
  public setProperties(properties: ViewProperties): void {
    Platform.getService(MessageBus).postMessage({
      channel: 'host',
      message: {type: ViewHostMessageTypes.PropertiesWrite, payload: properties} as HostMessage,
    });
  }

  /**
   * Gets properties of the view which is currently showing this application.
   */
  public getProperties(): Promise<ViewProperties> {
    return Platform.getService(MessageBus).requestReply({
      channel: 'host',
      message: {type: ViewHostMessageTypes.PropertiesRead} as HostMessage,
    }).then(envelope => envelope && envelope.message as ViewProperties || {});  // envelope is 'undefined' on shutdown
  }

  /**
   * Closes the view which is currently showing this application.
   */
  public close(): void {
    Platform.getService(MessageBus).postMessage({
      channel: 'host',
      message: {type: ViewHostMessageTypes.Close} as HostMessage,
    });
  }

  /**
   * Sets a notifier function which is called upon view destruction.
   * The notifier must return a falsy value to prevent view destruction,
   * either as a boolean value or as an observable which emits a boolean value.
   */
  public setDestroyNotifier(destroyNotifier: DestroyNotifier): void {
    this._destroyNotifier = destroyNotifier;
    this.setProperties({useDestroyNotifier: !!destroyNotifier});
  }

  /**
   * Indicates whether this view is the active viewpart view.
   * Emits the current state upon subscription.
   */
  public get active$(): Observable<boolean> {
    return this._active$.asObservable();
  }

  public onDestroy(): void {
    this._destroy$.next();
  }

  private handleActiveChange(envelope: MessageEnvelope<HostMessage>): void {
    this._active$.next(envelope.message.payload);
  }

  private handleBeforeDestroy(envelope: MessageEnvelope<HostMessage>): void {
    const destroyNotifier = this._destroyNotifier;

    const doitPromise = ((): Promise<boolean> => {
      if (!destroyNotifier) {
        return Promise.resolve(true);
      }

      const doit = destroyNotifier();
      if (typeof doit === 'boolean') {
        return Promise.resolve(doit);
      }
      if (doit instanceof Observable) {
        return doit.toPromise();
      }
      return doit;
    })();

    doitPromise.then(doit => Platform.getService(MessageBus).postMessage({
      channel: 'reply',
      replyToUid: envelope.replyToUid,
      replyTo: envelope.sender,
      message: doit,
    }));
  }
}

/**
 * Notifier function which is called upon view destruction.
 * The notifier must return a falsy value to prevent view destruction,
 * either as a boolean value or as an observable which emits a boolean value.
 */
type DestroyNotifier = () => Observable<boolean> | Promise<boolean> | boolean;
