// tslint:disable:unified-signatures

import { MessageClient } from './message-client';
import { EMPTY, from, fromEvent, merge, MonoTypeOperatorFunction, Observable, Observer, of, Subject, TeardownLogic, throwError } from 'rxjs';
import { BrokerConnector, BrokerWindowRef } from './broker-connector';
import { MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics, TopicSubscribeCommand, TopicUnsubscribeCommand } from '../ɵmessaging.model';
import { filterByChannel, filterByTopic, filterByTransport, pluckEnvelope, pluckMessage } from './operators';
import { filter, finalize, first, map, mergeMap, share, takeUntil, timeoutWith } from 'rxjs/operators';
import { Defined, UUID } from '@scion/toolkit/util';
import { Beans } from '../bean-manager';
import { Intent, Qualifier } from '../platform.model';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { matchesIntentQualifier } from '../qualifier-tester';
import { ClientConfig } from './client-config';
import { MicrofrontendPlatformState, PlatformStates } from '../microfrontend-platform-state';

export class ɵMessageClient implements MessageClient { // tslint:disable-line:class-name

  private readonly _destroy$ = new Subject<void>();
  private readonly _connector: BrokerConnector;
  private readonly _brokerMessages$: Observable<MessageEnvelope>;
  private readonly _clientConfig: ClientConfig;

  constructor() {
    this._clientConfig = Beans.get(ClientConfig);
    this._connector = new BrokerConnector(this._clientConfig);

    // Construct a stream of messages sent by the broker.
    this._brokerMessages$ = fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterByTransport(MessagingTransport.BrokerToClient),
        checkMessageOrigin(this._connector),
        pluckEnvelope(),
        share(),
        takeUntil(this._destroy$), // no longer emit messages when destroyed
      );

    // Disconnect from the broker when the platform has stopped and after all beans have been destroyed.
    Beans.get(MicrofrontendPlatformState).whenState(PlatformStates.Stopped).then(() => {
      this._destroy$.next();
      this._connector.disconnect().then();
    });
  }

  /** @publicApi **/
  public publish$(topic: string, message?: any): Observable<never>;
  public publish$(intent: Intent, payload?: any): Observable<never>;
  public publish$(destination: string | Intent, payload?: any): Observable<never> {
    if (typeof destination === 'string') {
      const topicMessage: TopicMessage = {topic: destination, payload: payload};
      return this.postMessageToBroker$(MessagingChannel.Topic, topicMessage);
    }
    else if (typeof destination === 'object' && destination.type) {
      const intentMessage: IntentMessage = {type: destination.type, qualifier: destination.qualifier, payload: payload};
      assertNoWildcardCharacters(intentMessage.qualifier);
      return this.postMessageToBroker$(MessagingChannel.Intent, intentMessage);
    }
    else {
      throw Error('[DestinationError] Destination must be of type `Topic` or `Intent`.');
    }
  }

  /** @publicApi **/
  public requestReply$<T>(topic: string, message?: any): Observable<TopicMessage<T>>;
  public requestReply$<T>(intent: Intent, payload?: any): Observable<TopicMessage<T>>;
  public requestReply$<T>(destination: string | Intent, payload?: any): Observable<TopicMessage<T>> {
    if (typeof destination === 'string') {
      const topicMessage: TopicMessage = {topic: destination, payload: payload};
      return this.postMessageToBrokerAndReceiveReplies$(MessagingChannel.Topic, topicMessage);
    }
    else if (typeof destination === 'object' && destination.type) {
      const intentMessage: IntentMessage = {type: destination.type, qualifier: destination.qualifier, payload: payload};
      assertNoWildcardCharacters(intentMessage.qualifier);
      return this.postMessageToBrokerAndReceiveReplies$(MessagingChannel.Intent, intentMessage);
    }
    else {
      throw Error('[DestinationError] Destination must be of type `Topic` or `Intent`.');
    }
  }

  /** @publicApi **/
  public observe$<T>(topic: string): Observable<TopicMessage<T>>;
  public observe$<T>(intentSelector?: Intent): Observable<IntentMessage<T>>;
  public observe$<T>(destination: string | Intent): Observable<TopicMessage> | Observable<IntentMessage<T>> {
    if (typeof destination === 'string') {
      return this.receiveMessage$(destination);
    }
    else if (!destination || typeof destination === 'object') {
      return this.receiveIntent$(destination);
    }
    else {
      throw Error('[DestinationError] Destination must be of type `Topic` or `Intent`.');
    }
  }

  /** @publicApi **/
  public subscriberCount$(topic: string): Observable<number> {
    return this.requestReply$<number>(PlatformTopics.SubscriberCount, topic)
      .pipe(map(message => message.payload));
  }

  private receiveMessage$<T>(topic: string): Observable<TopicMessage<T>> {
    return new Observable((observer: Observer<TopicMessage>): TeardownLogic => {
      const unsubscribe$ = new Subject<void>();
      const topicSubscribeError$ = new Subject<void>();

      // Receive messages sent to the given topic.
      merge(this._brokerMessages$, topicSubscribeError$)
        .pipe(
          filterByChannel(MessagingChannel.Topic),
          filterByTopic(topic),
          pluckMessage<TopicMessage<T>>(),
          takeUntil(merge(this._destroy$, unsubscribe$)),
          finalize(() => {
            const command: TopicUnsubscribeCommand = {topic: topic};
            this.postMessageToBroker$(MessagingChannel.TopicUnsubscribe, command).subscribe();
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

  private receiveIntent$<T>(selector?: Intent): Observable<IntentMessage<T>> {
    return this._brokerMessages$
      .pipe(
        filterByChannel(MessagingChannel.Intent),
        pluckMessage<IntentMessage<T>>(),
        filter(intent => !selector || !selector.type || selector.type === intent.type),
        filter(intent => !selector || !selector.qualifier || matchesIntentQualifier(selector.qualifier, intent.qualifier)),
      );
  }

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
      const deliveryTimeout = Defined.orElse(this._clientConfig.messaging && this._clientConfig.messaging.deliveryTimeout, 10000);
      this._brokerMessages$
        .pipe(
          filterByChannel(MessagingChannel.Topic),
          filterByTopic(messageId),
          first(),
          pluckMessage<TopicMessage<MessageDeliveryStatus>>(),
          timeoutWith(new Date(Date.now() + deliveryTimeout), throwError(`[MessageDispatchError] Broker did not report message dispatch state within the ${deliveryTimeout}ms timeout. [message=${JSON.stringify(envelope)}]`)),
          takeUntil(merge(unsubscribe$, this._destroy$)),
          mergeMap(statusMessage => statusMessage.payload.success ? EMPTY : throwError(statusMessage.payload.details)),
        )
        .subscribe(observer);

      // Dispatch the message to the broker.
      this._connector.whenConnected
        .then(broker => broker.window.postMessage(envelope, broker.origin))
        .catch(error => observer.error(error));

      return (): void => unsubscribe$.next();
    });
  }

  private postMessageToBrokerAndReceiveReplies$<T = any>(channel: MessagingChannel, message: IntentMessage | TopicMessage): Observable<TopicMessage<T>> {
    const replyToTopic = `ɵ${UUID.randomUUID()}`;
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

function checkMessageOrigin<T = any>(connector: BrokerConnector): MonoTypeOperatorFunction<MessageEvent> {
  return mergeMap((event: MessageEvent): Observable<MessageEvent> => {
    return from(connector.whenConnected).pipe(mergeMap((broker: BrokerWindowRef) => (event.origin === broker.origin) ? of(event) : EMPTY));
  });
}

function assertNoWildcardCharacters(qualifier: Qualifier): void {
  if (qualifier && Object.entries(qualifier).some(([key, value]) => key === '*' || value === '*' || value === '?')) {
    throw Error(`[IllegalQualifierError] Qualifier must not contain wildcards. [qualifier=${JSON.stringify(qualifier)}]`);
  }
}
