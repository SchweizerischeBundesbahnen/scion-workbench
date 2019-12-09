/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { mapToBody, MessageClient, MessageOptions, PublishOptions } from './message-client';
import { EMPTY, from, merge, noop, Observable, Observer, Subject, TeardownLogic, throwError } from 'rxjs';
import { MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../ɵmessaging.model';
import { filterByChannel, filterByTopic, pluckMessage } from './operators';
import { catchError, filter, finalize, first, mergeMap, mergeMapTo, takeUntil, timeoutWith } from 'rxjs/operators';
import { Defined, UUID } from '@scion/toolkit/util';
import { Intent, Qualifier } from '../platform.model';
import { IntentMessage, MessageHeaders, TopicMessage } from '../messaging.model';
import { matchesIntentQualifier } from '../qualifier-tester';
import { BrokerGateway } from './broker-gateway';
import { Beans, PreDestroy } from '../bean-manager';
import { HostPlatformState } from './host-platform-state';

// tslint:disable:unified-signatures
export class ɵMessageClient implements MessageClient, PreDestroy { // tslint:disable-line:class-name

  private readonly _destroy$ = new Subject<void>();
  private readonly _brokerGateway: BrokerGateway;

  constructor(clientAppName: string, private _config: { discoveryTimeout: number, deliveryTimeout: number }) {
    this._brokerGateway = new BrokerGateway(clientAppName, {discoveryTimeout: this._config.discoveryTimeout});
  }

  public publish$(topic: string, message?: any, options?: PublishOptions): Observable<never> {
    const topicMessage: TopicMessage = {topic, retain: Defined.orElse(options && options.retain, false), headers: options && options.headers || new Map()};
    setBodyIfDefined(topicMessage, message);
    return this.postMessageToBroker$(MessagingChannel.Topic, topicMessage);
  }

  public request$<T>(topic: string, request?: any, options?: MessageOptions): Observable<TopicMessage<T>> {
    const topicMessage: TopicMessage = {topic, retain: false, headers: options && options.headers || new Map()};
    setBodyIfDefined(topicMessage, request);
    // Delay sending the request until the host platform started to not lose the request if handled by a replier in the host.
    return from(Beans.get(HostPlatformState).whenStarted())
      .pipe(mergeMapTo(this.postMessageToBrokerAndReceiveReplies$(MessagingChannel.Topic, topicMessage)));
  }

  public observe$<T>(topic: string): Observable<TopicMessage<T>> {
    return this._observe$(topic);
  }

  public issueIntent$(intent: Intent, body?: any, options?: MessageOptions): Observable<never> {
    const intentMessage: IntentMessage = {type: intent.type, qualifier: intent.qualifier, headers: options && options.headers || new Map()};
    assertNoWildcardCharacters(intentMessage.qualifier);
    setBodyIfDefined(intentMessage, body);
    return this.postMessageToBroker$(MessagingChannel.Intent, intentMessage);
  }

  public requestByIntent$<T>(intent: Intent, body?: any, options?: MessageOptions): Observable<TopicMessage<T>> {
    const intentMessage: IntentMessage = {type: intent.type, qualifier: intent.qualifier, headers: options && options.headers || new Map()};
    assertNoWildcardCharacters(intentMessage.qualifier);
    setBodyIfDefined(intentMessage, body);
    // Delay sending the request until the host platform started to not lose the request if handled by a replier in the host.
    return from(Beans.get(HostPlatformState).whenStarted())
      .pipe(mergeMapTo(this.postMessageToBrokerAndReceiveReplies$(MessagingChannel.Intent, intentMessage)));
  }

  public handleIntent$<T>(selector?: Intent): Observable<IntentMessage<T>> {
    return this._handleIntent$(selector);
  }

  public subscriberCount$(topic: string): Observable<number> {
    return this.request$<number>(PlatformTopics.RequestSubscriberCount, topic).pipe(mapToBody());
  }

  /**
   * Receives messages from the broker published to the given topic.
   */
  private _observe$<T>(topic: string): Observable<TopicMessage<T>> {
    return new Observable((observer: Observer<TopicMessage>): TeardownLogic => {
      const unsubscribe$ = new Subject<void>();
      const topicSubscribeError$ = new Subject<void>();

      // Receive messages sent to the given topic.
      merge(this._brokerGateway.message$, topicSubscribeError$)
        .pipe(
          filterByTopic<T>(topic),
          takeUntil(merge(this._destroy$, unsubscribe$)),
          finalize(() => {
            const command: TopicUnsubscribeCommand = {topic: topic, headers: new Map()};
            this.postMessageToBroker$(MessagingChannel.TopicUnsubscribe, command)
              .pipe(catchError(() => EMPTY)) // do not propagate unsubscribe errors
              .subscribe();
          }),
        )
        .subscribe(observer);

      // Subscribe for the messages sent to the given topic.
      const topicSubscribeMessage: TopicSubscribeCommand = {topic: topic, headers: new Map()};
      this.postMessageToBroker$(MessagingChannel.TopicSubscribe, topicSubscribeMessage)
        .pipe(takeUntil(merge(this._destroy$, unsubscribe$)))
        .subscribe(topicSubscribeError$);

      return (): void => unsubscribe$.next();
    });
  }

  /**
   * Receives intents from the message broker for which this client has declared an intent.
   */
  private _handleIntent$<T>(selector?: Intent): Observable<IntentMessage<T>> {
    return this._brokerGateway.message$
      .pipe(
        filterByChannel<IntentMessage<T>>(MessagingChannel.Intent),
        pluckMessage(),
        filter(intent => !selector || !selector.type || selector.type === intent.type),
        filter(intent => !selector || !selector.qualifier || matchesIntentQualifier(selector.qualifier, intent.qualifier)),
      );
  }

  /**
   * Posts a message to the message broker.
   *
   * @return An Observable that completes upon successful delivery, or errors otherwise.
   */
  private postMessageToBroker$(channel: MessagingChannel, message: any): Observable<never> {
    const messageId = UUID.randomUUID();
    const envelope: MessageEnvelope = {
      transport: MessagingTransport.ClientToBroker,
      channel: channel,
      message: message,
      messageId: messageId,
    };

    return new Observable((observer: Observer<never>): TeardownLogic => {
      const unsubscribe$ = new Subject<void>();
      const deliveryError$ = new Subject<never>();

      // Wait until the message is delivered.
      merge(this._brokerGateway.message$, deliveryError$)
        .pipe(
          filterByTopic<MessageDeliveryStatus>(messageId),
          first(),
          timeoutWith(new Date(Date.now() + this._config.deliveryTimeout), throwError(`[MessageDispatchError] Broker did not report message delivery state within the ${this._config.deliveryTimeout}ms timeout. [message=${JSON.stringify(envelope)}]`)),
          takeUntil(merge(this._destroy$, unsubscribe$)),
          mergeMap(statusMessage => statusMessage.body.ok ? EMPTY : throwError(statusMessage.body.details)),
        )
        .subscribe(observer); // dispatch next, error and complete

      // Dispatch the message to the broker.
      this._brokerGateway.postMessage(envelope).catch(error => deliveryError$.error(error));

      return (): void => unsubscribe$.next();
    });
  }

  /**
   * Posts a message to the message broker and receives replies.
   */
  private postMessageToBrokerAndReceiveReplies$<T = any>(channel: MessagingChannel, message: IntentMessage | TopicMessage): Observable<TopicMessage<T>> {
    message.headers.set(MessageHeaders.ReplyTo, UUID.randomUUID());

    return new Observable((observer: Observer<TopicMessage>): TeardownLogic => {
      const unsubscribe$ = new Subject<void>();
      const deliveryError$ = new Subject<void>();

      // Receive replies sent to the reply topic.
      this._observe$<T>(message.headers.get(MessageHeaders.ReplyTo))
        .pipe(takeUntil(merge(this._destroy$, unsubscribe$, deliveryError$)))
        .subscribe(next => observer.next(next), error => observer.error(error)); // dispatch next and error, but not complete

      // Post the message to the broker.
      this.postMessageToBroker$(channel, message)
        .pipe(takeUntil(merge(this._destroy$, unsubscribe$)))
        .subscribe(noop, error => {
          deliveryError$.next();
          observer.error(error);
        });

      return (): void => unsubscribe$.next();
    });
  }

  /** @internal **/
  public preDestroy(): void {
    this._destroy$.next();
    this._brokerGateway.destroy();
  }
}

function assertNoWildcardCharacters(qualifier: Qualifier): void {
  if (qualifier && Object.entries(qualifier).some(([key, value]) => key === '*' || value === '*' || value === '?')) {
    throw Error(`[IllegalQualifierError] Qualifier must not contain wildcards. [qualifier=${JSON.stringify(qualifier)}]`);
  }
}

function setBodyIfDefined<T>(message: TopicMessage<T> | IntentMessage<T>, body?: T): void {
  if (body !== undefined) {
    message.body = body;
  }
}
