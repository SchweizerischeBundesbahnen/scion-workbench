/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Injector, OnDestroy } from '@angular/core';
import { MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { ErrorHandler } from './metadata';
import { Defined } from './defined.util';
import { ManifestRegistry } from './manifest-registry.service';
import { ApplicationRegistry } from './application-registry.service';
import { UUID } from './uuid.util';
import { Capability, CapabilityProviderMessage, Channel, IntentMessage, MessageEnvelope, PROTOCOL } from '@scion/workbench-application-platform.api';

/**
 * Allows communication between the workbench applications.
 */
@Injectable()
export class MessageBus implements OnDestroy {

  private _stream$ = new Subject<MessageEnvelope>();
  private _destroy$ = new Subject<void>();

  constructor(private _manifestRegistry: ManifestRegistry,
              private _applicationRegistry: ApplicationRegistry,
              private _errorHandler: ErrorHandler,
              private _injector: Injector) {
  }

  /**
   * Publishes a reply message to the message bus.
   */
  public publishReply(message: any, replyTo: string, replyToUid: string): void {
    Defined.orElseThrow(replyTo, () => Error('[MessageReplyError]: Missing \'replyTo\' field'));
    Defined.orElseThrow(replyToUid, () => Error('[MessageReplyError]: Missing \'replyToUid\' field'));

    this._stream$.next({
      protocol: PROTOCOL,
      channel: 'reply',
      replyToUid: replyToUid,
      replyTo: replyTo,
      message: message,
    });
  }

  /**
   * Publishes a message to the message bus.
   *
   * The message is only dispatched if the sending application qualifies for posting messages of this kind, or throws an error otherwise.
   *
   * If publishing the message from an application, provide options with the current execution context (injector, bounding box).
   */
  public publishMessageIfQualified(envelope: MessageEnvelope, sender: string, options?: { injector: Injector, outletBoundingBox?: ClientRect }): void {
    Defined.orElseThrow(sender, () => Error('[MessagePublishError] Missing \'sender\''));
    Defined.orElseThrow(envelope.message.type, () => Error('[MessagePublishError]: Missing \'type\' field'));

    envelope.sender = sender;
    envelope.protocol = PROTOCOL;
    envelope._injector = options && options.injector || this._injector;
    envelope._outletBoundingBox = options && options.outletBoundingBox;

    const appName = Defined.orElseThrow(this._applicationRegistry.getApplication(sender), () => Error(`[MessagePublishError] Application '${sender}' not registered`)).name;
    const qualifier = envelope.message.qualifier;
    const type = envelope.message.type;

    switch (envelope.channel) {
      case 'intent': {
        if (!this._manifestRegistry.hasIntent(sender, type, qualifier)) {
          const errorMessage = `Application '${appName}' is not qualified to publish intents of the type '${type}' and qualifier '${JSON.stringify(qualifier || {})}'. Ensure to have listed a respective intent in the application manifest.`;
          this._errorHandler.handleNotQualifiedIntentMessageError && this._errorHandler.handleNotQualifiedIntentMessageError(appName, type, qualifier, errorMessage);
          throw Error(`[NotQualifiedError]: ${errorMessage}`);
        }
        if (!this._manifestRegistry.isHandled(sender, type, qualifier)) {
          const errorMessage = `No application found to provide a capability of the type '${type}' and qualifiers '${JSON.stringify(qualifier || {})}'. Maybe, the capability is not public API or the providing application not available.`;
          this._errorHandler.handleNullProviderError && this._errorHandler.handleNullProviderError(appName, type, qualifier, errorMessage);
          throw Error(`[NullProviderError]: ${errorMessage}`);
        }
        break;
      }
      case 'capability': {
        if (!this._manifestRegistry.hasCapability(sender, type, qualifier)) {
          const errorMessage = `Application '${appName}' is not qualified to publish capability messages of the type '${type}' and qualifiers '${JSON.stringify(qualifier || {})}'. Ensure to have listed a respective capability in the application manifest.`;
          this._errorHandler.handleNotQualifiedCapabilityMessageError && this._errorHandler.handleNotQualifiedCapabilityMessageError(appName, type, qualifier, errorMessage);
          throw Error(`[NotQualifiedError]: ${errorMessage}`);
        }
        break;
      }
      default:
        throw Error(`[MessagePublishError]: Channel '${envelope.channel}' is not supported.`);
    }

    this._stream$.next(envelope);
  }

  /**
   * Initiates a request-reply communication.
   *
   * The message is only dispatched if the sending application qualifies for posting messages of this kind, or throws an error otherwise.
   *
   * If publishing the message from an application, provide options with the current execution context (injector, bounding box).
   */
  public requestReply(envelope: MessageEnvelope, sender: string, options?: { injector: Injector, outletBoundingBox?: ClientRect }): Promise<MessageEnvelope> {
    const replyToUid = UUID.randomUUID();
    envelope.replyToUid = replyToUid;

    const requestError$ = new Subject<void>();
    const replyPromise = this.receiveReplyMessagesForApplication$(sender)
      .pipe(
        filter(env => env.replyToUid === replyToUid),
        first(),
        takeUntil(this._destroy$),
        takeUntil(requestError$),
      ).toPromise();

    try {
      this.publishMessageIfQualified(envelope, sender, options);
    } catch (error) {
      requestError$.next();
    }
    return replyPromise;
  }

  /**
   * Receives messages posted from intents which the receiving application has registered a capability for.
   *
   * Intent messages sent by other applications are only received if the application's capability has public visibility.
   */
  public receiveIntentsForApplication$(symbolicName: string): Observable<MessageEnvelope<IntentMessage>> {
    return this._stream$.pipe(
      filterByChannel('intent'),
      filter(envelope => {
        const message = envelope.message as IntentMessage;

        // To receive the intent, the capability must have public visibility or provided by the intending application itself.
        const selector = (capability: Capability): boolean => {
          return !capability.private || this._manifestRegistry.isScopeCheckDisabled(symbolicName) || envelope.sender === symbolicName;
        };

        return this._manifestRegistry.hasCapability(symbolicName, message.type, message.qualifier, selector);
      }));
  }

  /**
   * Receives messages posted by applications providing a capability which the specified application has registered an intent for,
   * or if the receiving application is implicitly eligible because providing the capability itself.
   *
   * Messages sent by other applications are only received if the capability has public visibility.
   */
  public receiveProviderMessagesForApplication$(symbolicName: string): Observable<MessageEnvelope<CapabilityProviderMessage>> {
    return this._stream$.pipe(
      filterByChannel('capability'),
      filter(envelope => {
        const message = envelope.message as CapabilityProviderMessage;

        if (!this._manifestRegistry.hasIntent(symbolicName, message.type, message.qualifier)) {
          return false;
        }

        // To receive a message from a capability provider, the capability must have public visibility or provided by the application itself.
        return envelope.sender === symbolicName
          || this._manifestRegistry.isScopeCheckDisabled(symbolicName)
          || this._manifestRegistry.getCapabilities(message.type, message.qualifier)
            .filter(capability => capability.metadata.symbolicAppName === envelope.sender)
            .some(capability => !capability.private);
      }));
  }

  /**
   * Receives reply messages for the specified application.
   */
  public receiveReplyMessagesForApplication$(symbolicName: string): Observable<MessageEnvelope> {
    return this._stream$.pipe(
      filterByChannel('reply'),
      filter(envelope => envelope.replyTo === symbolicName));
  }

  public get stream$(): Observable<MessageEnvelope> {
    return this._stream$.asObservable();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function filterByChannel(channel: Channel): MonoTypeOperatorFunction<MessageEnvelope> {
  return filter(message => message.channel === channel);
}
