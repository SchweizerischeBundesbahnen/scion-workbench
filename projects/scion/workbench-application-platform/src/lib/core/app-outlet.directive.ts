/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, EventEmitter, Injector, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { RemoteSiteComponent } from '@scion/workbench';
import { merge, Subject } from 'rxjs';
import { MessageBus } from './message-bus.service';
import { filter, first, map, takeUntil } from 'rxjs/operators';
import { UUID } from './uuid.util';
import { HostMessage, ManifestHostMessageTypes, MessageEnvelope, parseMessageEnvelopeElseNull, PROTOCOL } from '@scion/workbench-application-platform.api';
import { ManifestRegistry } from './manifest-registry.service';

/**
 * Extends {RemoteSiteComponent} to interact with the application which is showing as a remote site.
 */
@Directive({
  selector: 'wb-remote-site[wapAppOutlet]',
})
export class AppOutletDirective implements OnInit, OnDestroy {

  /**
   * Specifies the symbolic name of the application showing in the remote site.
   */
  @Input('wapAppOutlet') // tslint:disable-line:no-input-rename
  public symbolicName: string;

  /**
   * Emits host messages posted by the application.
   */
  @Output('wapAppOutletHostMessage') // tslint:disable-line:no-output-rename
  public hostMessage = new EventEmitter<MessageEnvelope<HostMessage>>();

  private _destroy$ = new Subject<void>();
  private _host: Element;

  constructor(host: ElementRef<Element>,
              private _site: RemoteSiteComponent,
              private _messageBus: MessageBus,
              private _manifestRegistry: ManifestRegistry,
              private _injector: Injector,
              private _zone: NgZone) {
    this._host = host.nativeElement;
  }

  public ngOnInit(): void {
    this._manifestRegistry.capabilityChange$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.postHostMessage({type: ManifestHostMessageTypes.CapabilityChange});
      });

    // Dispatch messages from the message bus to the application
    const intentMessages$ = this._messageBus.receiveIntentsForApplication$(this.symbolicName);
    const providerMessages$ = this._messageBus.receiveProviderMessagesForApplication$(this.symbolicName);
    const replyMessages$ = this._messageBus.receiveReplyMessagesForApplication$(this.symbolicName);
    merge(intentMessages$, providerMessages$, replyMessages$)
      .pipe(takeUntil(this._destroy$))
      .subscribe((envelope: MessageEnvelope) => {
        this._site.postMessage(copyWithoutTransientFields(envelope));
      });

    // Dispatch messages from the application to the message bus
    this._site.message
      .pipe(takeUntil(this._destroy$))
      .subscribe((data: any) => {
        const envelope = parseMessageEnvelopeElseNull(data);
        if (!envelope) {
          return;
        }
        this._zone.run(() => this.dispatchMessageFromSite(envelope));
      });
  }

  private dispatchMessageFromSite(envelope: MessageEnvelope): void {
    try {
      if (envelope.channel === 'host') {
        this.hostMessage.emit(envelope);
      }
      else if (envelope.channel === 'reply') {
        this._messageBus.publishReply(envelope.message, envelope.replyTo, envelope.replyToUid);
      }
      else {
        this._messageBus.publishMessageIfQualified(envelope, this.symbolicName, {injector: this._injector, outletBoundingBox: this._host.getBoundingClientRect()});
      }
    }
    catch (error) {
      this.postHostError(error.message);
    }
  }

  /**
   * Posts a host message to the application.
   */
  public postHostMessage(message: HostMessage): void {
    this._site.postMessage({
      protocol: PROTOCOL,
      channel: 'host',
      message: message,
    });
  }

  /**
   * Posts an error to the application.
   */
  public postHostError(error: any): void {
    this.postHostMessage({type: 'error', payload: error});
  }

  /**
   * Initiates a request-reply communication with the application.
   */
  public requestReply<T>(message: HostMessage): Promise<T> {
    const replyToUid = UUID.randomUUID();

    const reply$ = this._messageBus.receiveReplyMessagesForApplication$(this.symbolicName)
      .pipe(
        filter(env => env.replyToUid === replyToUid),
        first(),
        takeUntil(this._destroy$),
        map(env => env.message),
      );

    const request: MessageEnvelope<HostMessage> = {
      protocol: PROTOCOL,
      channel: 'host',
      sender: this.symbolicName,
      replyToUid: replyToUid,
      message: message,
    };
    this._site.postMessage(request);

    return reply$.toPromise();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Creates a copy without transient fields included.
 * Transient fields are prefixed with an underscore.
 */
function copyWithoutTransientFields(envelope: MessageEnvelope): MessageEnvelope {
  const copy: MessageEnvelope = {...envelope};
  Object.keys(envelope)
    .filter(key => key.startsWith('_'))
    .forEach(key => delete copy[key]);
  return copy;
}
