/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageClient } from './message-client';
import { EMPTY, merge, Observable, Observer, Subject, TeardownLogic, throwError } from 'rxjs';
import { MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../ɵmessaging.model';
import { filterByChannel, filterByTopic, pluckMessage } from './operators';
import { catchError, filter, finalize, first, map, mergeMap, takeUntil, timeoutWith } from 'rxjs/operators';
import { UUID } from '@scion/toolkit/util';
import { Beans } from '../bean-manager';
import { Intent, Qualifier } from '../platform.model';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { matchesIntentQualifier } from '../qualifier-tester';
import { MicrofrontendPlatformState, PlatformStates } from '../microfrontend-platform-state';
import { BrokerGateway } from './broker-gateway';

// tslint:disable:unified-signatures
export class ɵMessageClient implements MessageClient { // tslint:disable-line:class-name

  private readonly _destroy$ = new Subject<void>();
  private readonly _brokerGateway: BrokerGateway;

  constructor(clientAppName: string, private _config: { discoveryTimeout: number, deliveryTimeout: number }) {
    this._brokerGateway = new BrokerGateway(clientAppName, {discoveryTimeout: this._config.discoveryTimeout});

    // Disconnect from the broker when the platform has stopped and after all beans have been destroyed.
    Beans.get(MicrofrontendPlatformState).whenState(PlatformStates.Stopped).then(() => {
      this._destroy$.next();
      this._brokerGateway.destroy();
    });
  }

  public publish$(topic: string, message?: any): Observable<never> {
    const topicMessage: TopicMessage = {topic, payload: message};
    return this.postMessageToBroker$(MessagingChannel.Topic, topicMessage);
  }

  public request$<T>(topic: string, request?: any): Observable<TopicMessage<T>> {
    const topicMessage: TopicMessage = {topic, payload: request};
    return this.postMessageToBrokerAndReceiveReplies$(MessagingChannel.Topic, topicMessage);
  }

  public observe$<T>(topic: string): Observable<TopicMessage<T>> {
    return this.receiveMessage$(topic);
  }

  public issueIntent$(intent: Intent, payload?: any): Observable<never> {
    const intentMessage: IntentMessage = {type: intent.type, qualifier: intent.qualifier, payload};
    assertNoWildcardCharacters(intentMessage.qualifier);
    return this.postMessageToBroker$(MessagingChannel.Intent, intentMessage);
  }

  public requestByIntent$<T>(intent: Intent, payload?: any): Observable<TopicMessage<T>> {
    const intentMessage: IntentMessage = {type: intent.type, qualifier: intent.qualifier, payload};
    assertNoWildcardCharacters(intentMessage.qualifier);
    return this.postMessageToBrokerAndReceiveReplies$(MessagingChannel.Intent, intentMessage);
  }

  public handleIntent$<T>(selector?: Intent): Observable<IntentMessage<T>> {
    return this.receiveIntent$(selector);
  }

  public subscriberCount$(topic: string): Observable<number> {
    return this.request$<number>(PlatformTopics.SubscriberCount, topic)
      .pipe(map(message => message.payload));
  }

  /**
   * Receives topic messages from the message broker.
   * There are only messages received for which the client has a topic subscription.
   */
  private receiveMessage$<T>(topic: string): Observable<TopicMessage<T>> {
    return new Observable((observer: Observer<TopicMessage>): TeardownLogic => {
      const unsubscribe$ = new Subject<void>();
      const topicSubscribeError$ = new Subject<void>();

      // Receive messages sent to the given topic.
      merge(this._brokerGateway.message$, topicSubscribeError$)
        .pipe(
          filterByTopic<T>(topic),
          takeUntil(merge(this._destroy$, unsubscribe$)),
          finalize(() => {
            const command: TopicUnsubscribeCommand = {topic: topic};
            this.postMessageToBroker$(MessagingChannel.TopicUnsubscribe, command)
              .pipe(catchError(() => EMPTY)) // do not propagate unsubscribe errors
              .subscribe();
          }),
        )
        .subscribe(observer);

      // Subscribe for the messages sent to the given topic.
      const topicSubscribeMessage: TopicSubscribeCommand = {topic: topic};
      this.postMessageToBroker$(MessagingChannel.TopicSubscribe, topicSubscribeMessage)
        .pipe(takeUntil(merge(this._destroy$, unsubscribe$)))
        .subscribe(topicSubscribeError$);

      return (): void => unsubscribe$.next();
    });
  }

  /**
   * Receives intents from the message broker for which this client has declared an intent.
   */
  private receiveIntent$<T>(selector?: Intent): Observable<IntentMessage<T>> {
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

      // Wait until the message is delivered.
      this._brokerGateway.message$
        .pipe(
          filterByTopic<MessageDeliveryStatus>(messageId),
          first(),
          timeoutWith(new Date(Date.now() + this._config.deliveryTimeout), throwError(`[MessageDispatchError] Broker did not report message delivery state within the ${this._config.deliveryTimeout}ms timeout. [message=${JSON.stringify(envelope)}]`)),
          takeUntil(merge(unsubscribe$, this._destroy$)),
          mergeMap(statusMessage => statusMessage.payload.ok ? EMPTY : throwError(statusMessage.payload.details)),
        )
        .subscribe(observer);

      // Dispatch the message to the broker.
      this._brokerGateway.postMessage(envelope).catch(error => observer.error(error));

      return (): void => unsubscribe$.next();
    });
  }

  private postMessageToBrokerAndReceiveReplies$<T = any>(channel: MessagingChannel, message: IntentMessage | TopicMessage): Observable<TopicMessage<T>> {
    const replyToTopic = UUID.randomUUID();
    const request: IntentMessage | TopicMessage = {...message, replyTo: replyToTopic};

    return new Observable((observer: Observer<TopicMessage>): TeardownLogic => {
      const unsubscribe$ = new Subject<void>();
      const deliveryError$ = new Subject<never>();

      // Receive replies sent to the reply topic.
      merge(this.receiveMessage$<T>(replyToTopic), deliveryError$)
        .pipe(takeUntil(merge(this._destroy$, unsubscribe$)))
        .subscribe(observer);

      // Post the message to the broker.
      this.postMessageToBroker$(channel, request)
        .pipe(takeUntil(merge(this._destroy$, unsubscribe$)))
        .subscribe(deliveryError$);

      return (): void => unsubscribe$.next();
    });
  }
}

function assertNoWildcardCharacters(qualifier: Qualifier): void {
  if (qualifier && Object.entries(qualifier).some(([key, value]) => key === '*' || value === '*' || value === '?')) {
    throw Error(`[IllegalQualifierError] Qualifier must not contain wildcards. [qualifier=${JSON.stringify(qualifier)}]`);
  }
}
